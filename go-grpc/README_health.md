上一篇[文章]()我们学习了`gRPC`的基础概念和在`Golang`如何使用`gRPC`的入门指南。今天这篇文章将学习在`golang`中使用`gRPC`的健康检查。健康检查在监控服务工作状态时发挥着重要作用。

## 概述

`gRPC`指定了一个标准服务API[（health/v1）])(https://github.com/grpc/grpc-proto/blob/master/grpc/health/v1/health.proto)，用于对`gRPC`服务器执行健康检查调用。`gRPC`提供了该服务的实现，但更新服务健康状态的责任由实现者完成。

你可以让客户端自动与服务端进行健康服务检查。这样客户端就能避免使用被认为不健康的服务。


## 实现

`gRPC`服务端健康检查服务支持两种运行模式:
- 对检查`rpc`端点的一元调用

> 适用于集中监控或负载平衡解决方案，但无法扩展以支持不断进行健康检查的`gRPC`客户端，说白了就是给监控用得。

- 使用`Watch rpc`端点串流健康状况更新

> 由`gRPC`客户端的客户端健康检查功能使用

在服务端上启用健康检查服务包括以下步骤：

1. 使用提供的健康检查库创建健康检查服务
2. 将健康检查服务注册到服务
3. 当您的某项服务的健康状况发生变化时，通知健康检查库

> 如果您的服务暂时无法接受请求，则为 NOT_SERVING
> SERVING（服务正在运行），表示服务已开始运行  
> 如果您不关心单个服务的健康状况，可以使用空字符串（""）来表示整个服务器的健康状况。

4. 确保通知健康检查库有关服务端关闭的信息，以便它通知所有已连接的客户端。

目前健康检查不是所有语言都支持。

客户端通过修改通道的服务配置，可以配置`gRPC`客户端对其连接的服务端进行健康检查。

```json
{
  "healthCheckConfig": {
    "serviceName": ""
  }
}
```
> 如果您的服务端报告空字符串（""）服务的健康状况，表示整个服务器的健康状况，您也可以在此处(**serviceName**)使用空字符串。

客户端启用健康检查会改变调用服务器时的某些行为：

- 建立连接后，客户端还将调用健康检查服务上的`Watch RPC`
- 在健康检查服务为被调用的服务发送健康状态之前，不会发送请求
- 如果健康的服务变得不健康，客户端将不再向该服务发送请求
- 如果随后服务恢复正常，呼叫将被恢复
- 如果健康检查功能对某些负载平衡策略没有意义，则可选择禁用该功能

更具体地说，子通道（代表与服务器的物理连接）的状态会根据所连接服务的健康状况而经历这些状态。

![grpc-health-state](https://static.loocode.com/upload/images/20231229/grpc-health-state.png)


### 服务端实现

根据上面的说得服务端实现步骤，我们就可以添加相应的代码。代码还是用上篇文章的示例进行追加。

```go
	// 创建rpc server
	s := grpc.NewServer()
	// 创建健康检查server
	healthSvr := health.NewServer()
	// 注册健康检查server
    healthgrpc.RegisterHealthServer(s, healthSvr)

	// 将状态信道传递给服务实现者, 实现者内容更新状态。
    state := make(chan healthpb.HealthCheckResponse_ServingStatus, 1)
    // 使用自己的实现
    imp := &rpcAuthorization{svrState: state} 

    // 启动一个新的协程更新服务状态,
	go func() {
        next := healthpb.HealthCheckResponse_SERVING
        for {
            healthSvr.SetServingStatus(system, next)
            log.Printf("change state: %d\n", next)
            next = <-state
            time.Sleep(*sleep)
        }
    }()

```

为服务添加更新状态的逻辑，我们以随机的方式来让服务变成可用不可用。


```go

func (r *rpcAuthorization) Login(ctx context.Context, request *rpc.LoginRequest) (*rpc.LoginResponse, error) {
	//TODO implement me
	if len(request.Email) < 1 || len(request.Password) < 1 {
		return &rpc.LoginResponse{
			Message: "邮箱或密码不能为空",
		}, nil
	}
	if request.Email == "admin@admin.com" && request.Password == "123456" {
		return &rpc.LoginResponse{
			Message: "success",
			User: &rpc.User{
				Id:       1,
				Email:    "admin@admin.com",
				Username: "admin",
				Avatar:   "https://github.com/identicons/meshell.png",
			},
		}, nil
	}
    // 密码错误之后，让服务不可用
	r.svrState <- healthpb.HealthCheckResponse_NOT_SERVING
	return &rpc.LoginResponse{
		Message: "邮箱或密码错误",
	}, nil
}

```

现在服务密码错误之后会被改为不可用状态**(实际业务肯定不能这么干得🐶，实际业务可能`redis`, `db`这些出现问题的时候才需要调整状态)**，这时候其他客户端调用接口会优先检测服务健康状态。那怎么恢复状态呢，我们为服务新增一个http接口来更新状态。

```go
    // 启动一个恢复接口
    go func() {
		mux := http.NewServeMux()
		mux.HandleFunc("/update", func(writer http.ResponseWriter, request *http.Request) {
			state <- grpc_health_v1.HealthCheckResponse_SERVING
			writer.WriteHeader(http.StatusOK)
            _, err := io.WriteString(writer, "update success\n")
            if err != nil {
                return
            }
		})
		err := http.ListenAndServe(":8082", mux)
		if err != nil {
			return
		}
	}()
```

### 客户端实现

以下代码就是客户端的实现，我使用了多个服务端地址。

```go

    var (
    serviceConfig = `{
        "loadBalancingPolicy": "round_robin",
        "healthCheckConfig": {
            "serviceName": ""
        }
    }`
    )

	r := manual.NewBuilderWithScheme("authorization")
	r.InitialState(resolver.State{
        // 使用多个服务地址
		Addresses: []resolver.Address{
			{Addr: "localhost:8080"},
			{Addr: "localhost:8081"},
		},
	})
	address := fmt.Sprintf("%s:///unused", r.Scheme())
	options := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
		grpc.WithResolvers(r),
		grpc.WithDefaultServiceConfig(serviceConfig),
	}
	// 创建一个链接
	conn, err := grpc.Dial(address, options...)

    // 每隔5秒调用一次接口, 当健康检测未通过时会直接报错
	for {
        (func() {
            // 调用服务中的接口 3
            ctx3, cancel3 := context.WithTimeout(context.Background(), time.Second)
            defer cancel3()
            res, err = c.Login(ctx3, &rpc.LoginRequest{Email: "admin@admin.com", Password: "12345623"})
            if err != nil {
                log.Fatalf("Login error: %v", err)
            }
            log.Printf("Login message: %s, %v", res.Message, res.User)
        })()
        time.Sleep(time.Second * 5)
	}
```

现在代码已经全部完成，我直接进行测试。

### 测试运行

先启动两个服务端监听。

```bash
# 服务端1 
[server#] go run main.go
2024/01/10 10:23:26 change state: 1
```

```bash
# 服务端2
[server#] go run main.go --port=8081 
2024/01/10 10:24:26 change state: 1
```

启动客户端测试。

```bash
[client#] go run main.go
2024/01/10 10:26:26 Login message: 邮箱或密码不能为空
2024/01/10 10:26:26 Login message: 邮箱或密码错误 # 服务切换状态
2024/01/10 10:26:26 Login message: 邮箱或密码错误, <nil> # 服务切换状态
# 5秒之后请求，两个服务的状态都是不可用状态，就直接报错了
2024/01/10 10:26:31 Login error: rpc error: code = Unavailable desc = last connection error: connection active but health check failed. status=NOT_SERVING
exit status 1  
```

先看下服务端的输出日志。

```bash
# 服务端1
[server#] go run main.go 
2024/01/10 10:23:26 change state: 1
2024/01/10 10:26:31 change state: 2
```

```bash
# 服务端2
[server#] go run main.go --port=8081
2024/01/10 10:24:26 change state: 1
2024/01/10 10:26:31 change state: 2
```

现在两个服务的状态都是不可用得，如果重新启动客户端，客户端会一直等待服务恢复。下面的图片可以更直观的感受到：

![grpc-state-update](https://static.loocode.com/upload/images/20231229/grpc-state-update.gif)

今天的文章就到此结束了，大家可以根据[源码](https://github.com/TianLiangZhou/loocode-example/tree/master/go-grpc)本地测试实践下。

### 推荐阅读

1. [https://grpc.io/docs/guides/health-checking/](https://grpc.io/docs/guides/health-checking/)
2. [health README](https://github.com/grpc/grpc-go/blob/master/examples/features/health/README.md)
3. [A17-client-side-health-checking](https://github.com/grpc/proposal/blob/master/A17-client-side-health-checking.md)
4. [本文源码](https://github.com/TianLiangZhou/loocode-example/tree/master/go-grpc)
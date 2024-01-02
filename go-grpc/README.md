本教程是讲解`golang`中使用`gRPC`的入门指南，教程会从基本的概念到环境、安装、服务端实现、客户端实现来进行逐步讲解。在学习教程之前你需要对`golang`语言和`protobuf`有一定的了解。

## 什么是gRPC?

`gRPC`是由`google`开发并开源的高性能远程过程调用[（RPC）](https://zh.wikipedia.org/zh-cn/%E9%81%A0%E7%A8%8B%E9%81%8E%E7%A8%8B%E8%AA%BF%E7%94%A8)框架，可让客户端和服务器应用程序以透明方式进行远程通信。现在它已经成为[CNCF](https://www.cncf.io/)项目。

顺便说一下，如果你想知道`gRPC`中的**g**代表什么?，每个`gRPC`代表的含义都不一样。你可以查看此[链接](https://github.com/grpc/grpc/blob/master/doc/g_stands_for.md)来看看每个版本的意思。

### 概述

在`gRPC`中，客户端应用程序可以直接调用不同机器上服务器应用程序的方法，就像调用本地对象一样，这样就能更轻松地创建分布式应用程序和服务。与许多`RPC`系统一样，`gRPC`以定义服务为基础，指定可远程调用的方法及其参数和返回类型。在服务器端，服务器实现这一接口并运行`gRPC`服务器来处理客户端调用。在客户端，客户端有一个存根（在某些语言中称为客户端），提供与服务器相同的方法。

![grpc-architecture](https://static.loocode.com/upload/images/20231229/grpc-architecture.png?v=1.0.15)

照片由[gRPC](https://grpc.io/docs/what-is-grpc/introduction/)根据[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode)许可提供。

`gRPC`客户端和服务端可以在各种环境中运行并相互通信--(从谷歌内部的服务器到你自己的桌面)--而且可以用任何一种`gRPC`支持的语言编写。因此，你可以轻松地用`Java`创建一个`gRPC`服务器，用`Go`、`Python`、`PHP`、`Node`、`C++`、`Kotlin`、`C#/.NET`或`Ruby`编写客户端。此外，最新的Google应用程序接口（API）也将拥有`gRPC`版本的接口，让您可以轻松地在应用程序中构建`Google`功能。


### 协议与数据格式

既然是`RPC`调用那就存在通信协议和消息数据交换格式。`gRPC`默认情况下使用`http/2`作为通信协议。消息格式默认情况下使用协议缓冲区作为其接口定义语言和底层消息数据交换格式。协议缓冲区[（又称protobuf）](https://protobuf.dev)是一种与语言无关的结构化数据序列化协议，可在不同编程语言之间使用。它们是强类型的，可确保数据在不同的应用程序和服务中保持一致且格式良好。当然你也可以`JSON`或者其它的消息格式。


### gRPC与Protobuf的优势

**性能**: Protobuf使用二进制数据表示，因此数据包的传输速度比`JSON`或`XML`等其他格式更快。这是因为二进制数据比基于文本的格式更紧凑、更容易解析。`Protobuf`的序列化和反序列化效率也更高，在某些情况下可以带来更好的性能。

**HTTP/2传输协议**: `gRPC`在HTTP/2上运行，与HTTP 1.1相比，HTTP/2具有多项优势，如实时通信和大大提高的网络效率。HTTP/2支持双向流、多路复用等。

- **双向流**是实时应用的理想选择，因为它使客户端和服务器能够发送和接收数据，而无需等待请求或响应完成后再发送下一条信息。在某些使用情况下，这对实现高性能和低延迟至关重要
- **多路复用**使多个请求和响应可以通过一个TCP连接同时发送。HTTP/2可通过同一连接同时发送多个请求，而不是为每个请求打开一个新连接，服务器可按任何顺序对它们做出响应。

**自动生成代码**: 将`Protobuf`与`gRPC`结合使用的一大好处是，它们能自动生成适用于不同语言的代码，从而使创建使用`gRPC`的客户端和服务器应用程序变得更加容易。这可以节省时间和精力，因为开发人员无需编写代码来序列化或反序列化不同系统之间的数据。

**Protobuf严格的合约可防止错误**: `gRPC`使用`Protobuf`来定义应用程序接口、数据结构和端点。这就在客户端和服务器之间形成了严格的契约，因为契约是强类型的。这些严格的合约有助于防止错误和意外行为的发生，因为客户端和服务器都清楚地知道应该期待哪些数据以及如何处理这些数据。

**通过版本管理实现平滑迁移**: 使用`gRPC`的另一个好处是能够平滑迁移到新版本的API，同时保持向后兼容性。 可以查看微软在这方面[最佳实践](https://learn.microsoft.com/en-us/aspnet/core/grpc/versioning?view=aspnetcore-7.0)。

**负载均衡**：`gRPC`支持负载均衡，可以在多个服务实例之间自动分配请求，提高可用性和性能。

**拦截器和中间件**：`gRPC`允许在请求和响应的处理过程中使用拦截器和中间件来添加自定义逻辑，例如认证、授权和日志记录。



### gRPC的缺点

- 复杂性：`gRPC`可能会对新手来说有一定的学习曲线，特别是在配置和部署方面。它需要深入了解HTTP/2和`Protobuf`
- 协议不可读：`gRPC`使用二进制编码，使通信数据不可读。这在调试时可能会造成一些困难。
- 测试难度升高：由于使用`Protobuf`，在测试请求需要一个`proto`文件，因为你不能直接写入二进制数据。
- 不合适浏览器场景: 浏览器缺乏对它的支持，虽然可以使用[gRPC Gateway](https://github.com/grpc-ecosystem/grpc-gateway)和[gRPC-Web](https://github.com/grpc/grpc-web)来解决这个问题，同时也增加了系统的复杂性。

### 适应场景

- 任何客户端不是浏览器: 协议缓冲区提供了一种定义API合约的方法，可确保客户端和服务器应用程序就如何交换信息达成一致意见。
- 服务与服务: 无论服务是用哪种框架或语言编写的，`gRPC`都能让它们以透明的方式相互通信。这对于需要在系统不同部分之间实现互操作性的大型企业来说尤其有利。
- 认证机制: `gRPC`提供对各种身份验证机制的内置支持，并允许你插入自己的机制，从而轻松确保服务之间的通信安全。
- 任何可以使用`RPC`的地方。

> 其实上述场景说得其实就已经包括了微服务通信，高性能API、跨语言通信、实时应用程序这些场景。

通过上面的介绍我们基本的知道了`gRPC`的基础概念，优缺点，适应场景，消息格式。后面我们将围绕在`golang`中如何使用`gRPC`，`protoc-gen-go`代码生成，实现服务端和客户端。

## Golang与gRPC

`gRPC`支持多种语言，`golang`就是其中一种。使用前你需要安装配置好基本的运行环境。

### 环境要求

- [Go语言](https://golang.org/)，有关安装说明，请参阅[Go入门指南](https://golang.org/doc/install)。
- [Protocol buffer](https://developers.google.com/protocol-buffers)编译器, 版本3(proto 3)。[下载安装](https://github.com/protocolbuffers/protobuf/releases)
- **Protocol buffer**编译器的Go插件

使用以下命令为Go安装协议编译器插件：

```bash
[$] go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
[$] go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

更新您的`PATH`以便`protoc`编译器可以找到插件：

```bash
[$] export PATH="$PATH:$(go env GOPATH)/bin"
```

> 请注意本教程所有命令都是以`Macos`作为执行环境，如果你是以`window`作为环境请修改对应的命令语法。比如上述的命令。

### 创建Protobuf合约文件.proto

我们这次以登录作为本次的示例，需要实现授权服务里面的登录接口。为登录服务定义`authorization.proto`文件。

```protobuf
// 版本
syntax = "proto3";

// 生成文件的go包名
option go_package = "go-grpc/rpc";

package proto;

service Authorization {
  // 登录rpc接口
  rpc Login(LoginRequest) returns (LoginResponse) {}
}

message LoginRequest {
  // 第一个参数
  string email = 1;
  // 第二个参数
  string password = 2;

}

message LoginResponse {
  string message = 1;
  optional User user = 2;
}

message User {
  int64 id = 1;
  string email = 2;
  string username = 3;
  string avatar = 4;
}
```

如何你还不清楚`.proto`文件的一些语法规则可以先阅读下[官方文档](https://protobuf.dev/programming-guides/proto3/)。


使用`protoc`自动生成服务端和客户端代码，执行下面命令即可。

```bash
[$] protoc --go_out=../rpc --go_opt=paths=source_relative  --go-grpc_out=../rpc --go-grpc_opt=paths=source_relative authorization.proto
```

执行完成后会生成两个文件: **authorization.pb.go**和**authorization_grpc.pb.go**，只需要导入就可以使用，服务的接口需要自己实现。

### 服务端

代码生成完，现在实现服务端程序。服务端程序流程非常简单只需要监听端口，实现RPC服务中的接口，之后注册RPC服务。

```go
package main

import (
	"flag"
	"fmt"
	"go-grpc/rpc"
	"google.golang.org/grpc"
	"log"
	"net"
)

var (
	port = flag.Int("port", 8080, "服务监听端口")
)

func main() {
	flag.Parse()
    // 监听端口
	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))
	if err != nil {
		panic(fmt.Sprintf("failed to listen: %v", err))
	}
    // 创建RPC服务
	s := grpc.NewServer()
    // 使用自动生成的代码
	imp := rpc.UnimplementedAuthorizationServer{}
    // 注册RPC服务
	rpc.RegisterAuthorizationServer(s, imp)
    // 启动服务
	if err := s.Serve(listener); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
```

这里就是整个服务端的代码，暂时先不实现服务里面的接口。先实现客户端代码，


### 客户端

客户端的实现和服务端类似，只是服务服务端需要实现服务中的接口，客户端负责调用即可。下面展示客户端的完整代码：

```go
package main

import (
	"context"
	"flag"
	"go-grpc/rpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"log"
	"time"
)

var (
	addr = flag.String("addr", "localhost:8080", "连接的服务地址")
)

func main() {
	flag.Parse()
	// 创建一个链接
	conn, err := grpc.Dial(*addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()
	// 创建一个服务客户端
	c := rpc.NewAuthorizationClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	// 调用服务中的接口
	r, err := c.Login(ctx, &rpc.LoginRequest{Email: "", Password: ""})
	if err != nil {
		log.Fatalf("Login error: %v", err)
	}
	log.Printf("Login message: %s", r.Message)
}
```

完成客户端代码后，我们运行程序来看看效果。先启动服务端程序之后再运行客户端程序。


```bash
[client$] go run main.go
2024/01/02 12:58:39 Login error: rpc error: code = Unimplemented desc = method Login not implemented
exit status 1
```
运行客户端程序后，显示了报错信息，说Login接口没有实现。

### 实现服务端接口

实现服务端接口，需要实现自动生成代码中的接口。接口名是以服务名加`Server`组成，比如本例中的`AuthorizationServer`。 下面展示了服务接口实现的代码: 

```go

type rpcAuthorization struct {
	rpc.UnimplementedAuthorizationServer
}
func (r rpcAuthorization) Login(ctx context.Context, request *rpc.LoginRequest) (*rpc.LoginResponse, error) {
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
	return &rpc.LoginResponse{
		Message: "邮箱或密码错误",
	}, nil
}
func (r rpcAuthorization) mustEmbedUnimplementedAuthorizationServer() {
	panic("implement me")
}
```

只需要实现我们定义的接口就行，再把服务端注册`RPC`服务处的代码更改如下：

```go
	// 使用自动生成的代码
	//imp := rpc.UnimplementedAuthorizationServer{}
    // 使用自己的实现
	imp := rpcAuthorization{}
	// 注册RPC服务
	rpc.RegisterAuthorizationServer(s, imp)
```

重新更改下客户端代码，分别三种情况调用三次接口: 参数为空，正确账号密码，错误账号密码。

```go
// 调用服务中的接口 1
	r, err := c.Login(ctx, &rpc.LoginRequest{Email: "", Password: ""})
	if err != nil {
		log.Fatalf("Login error: %v", err)
	}
	log.Printf("Login message: %s", r.Message)

	// 调用服务中的接口 2
	r, err = c.Login(ctx, &rpc.LoginRequest{Email: "admin@admin.com", Password: "error password"})
	if err != nil {
		log.Fatalf("Login error: %v", err)
	}
	log.Printf("Login message: %s", r.Message)

	// 调用服务中的接口 3
	r, err = c.Login(ctx, &rpc.LoginRequest{Email: "admin@admin.com", Password: "123456"})
	if err != nil {
		log.Fatalf("Login error: %v", err)
	}
	log.Printf("Login message: %s, %v", r.Message, r.User)

```

重新执行下客户端代码。

```bash
[$] go run main.go 
2024/01/02 13:47:10 Login message: 邮箱或密码不能为空
2024/01/02 13:47:10 Login message: 邮箱或密码错误
2024/01/02 13:47:10 Login message: success, id:1 email:"admin@admin.com" username:"admin" avatar:"https://github.com/identicons/meshell.png"
```
代码是按我们预期的那样工作。至此我们的整个服务端和客户端的代码全部完成。`gRPC`是可以跨多种语言通信的，下面我们生成`PHP`版的客户端程序来验证服务端程序。


### PHP版客户端

实现之前需要根据`.proto`文件生成对应的`PHP`代码文件。下面命令展示了如何生成：

```bash
[$]protoc --proto_path=proto --php_out=php-rpc proto/authorization.proto
```

> 注意此运行是没有`grpc_php_plugin`插件(生成客户端代码)，如果你安装了你可以使用下面的命令
> protoc --proto_path=proto --php_out=php-rpc --grpc_out=php-rpc --plugin=protoc-gen-grpc=grpc_php_plugin插件地址 proto/authorization.proto

下面代码就是PHP客户端代码完整调用测试: 

```php
<?php

include __DIR__ . "/vendor/autoload.php";

$hostname = "localhost:8080";

$client = new Proto\AuthorizationClient($hostname, [
    'credentials' => Grpc\ChannelCredentials::createInsecure(),
]);
$request = new Proto\LoginRequest();
$request->setEmail("");
$request->setPassword("");
list($response, $status) = $client->Login($request)->wait();
if ($status->code !== Grpc\STATUS_OK) {
    echo "ERROR: " . $status->code . ", " . $status->details . PHP_EOL;
    exit(1);
}
echo $response->getMessage() . PHP_EOL;

$request = new Proto\LoginRequest();
$request->setEmail("admin@admin.com");
$request->setPassword("admin");
list($response, $status) = $client->Login($request)->wait();
if ($status->code !== Grpc\STATUS_OK) {
    echo "ERROR: " . $status->code . ", " . $status->details . PHP_EOL;
    exit(1);
}
echo $response->getMessage() . PHP_EOL;

$request = new Proto\LoginRequest();
$request->setEmail("admin@admin.com");
$request->setPassword("123456");
list($response, $status) = $client->Login($request)->wait();
if ($status->code !== Grpc\STATUS_OK) {
    echo "ERROR: " . $status->code . ", " . $status->details . PHP_EOL;
    exit(1);
}
echo $response->getMessage() . PHP_EOL;

var_dump($response->getUser());
```

使用下面的命令测试运行代码。

```bash
[$]composer install
[$]php client.php
邮箱或密码不能为空
邮箱或密码错误
success
object(Proto\User)#17 (0) {
}
```
> 在运行之前你需要安装`grpc`扩展和`protobuf`扩展，你可以使用`pecl install protobuf`和`pecl install grpc`两条命令来安装。

至此我们已经完成了本文的所有内容。

## 总结

相信大家阅读此文后已经对`gRPC`有了相应的了解，在`golang`中使用`gRPC`也会有一定了解。如果您有什么问题，你可以在下方的留言区域给我留言。本文的代码都托管在[这里]()。



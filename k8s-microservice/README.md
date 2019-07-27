微服务是最近几年非常流行的平台架构方案。微服务将项目拆分成多个小而全的工程，工程之间通过`http`或`tcp`交互自己的数据。微服务的部署一直都是一个棘手的问题，由于`docker`, `kubernetes`的兴起，让我们管理部署微服务更加简单。
可以通过[gitlab](https://gitlab.com) + [docker](https://www.docker.com/) + [harbor](https://github.com/goharbor/harbor) + [drone](https://github.com/drone/drone) + [kubernetes](https://kubernetes.io)打造公司项目一键管理发布，扩容，下架。
这篇文章会讲解如何从零开始部署一个项目到`kubernetes`，你需要了解一些`kubernetes`, `Docker`的基础知识，比如`Deployment`、`Pods`、`Service`、`Ingress`和`Dockerfile`等一些知识点。你可以通过[这篇文章](https://loocode.com/post/10174)来学习下。 

#### 一个微小的服务

通过编写一个简单程序来作为我们的第一个微服务。使`golang`的[echo](https://github.com/labstack/echo)架构编写几个简单的`http`接口。

我将使用`go`的1.12版本，为工程初化一个`mod`。

```bash
go mod init github.com/tianliangzhou/k8s-microservice
```

> Note: 如果你想使用go mod功能，你需要将你的go升级到1.11以上.

**接口实现**

示例中实现了三个接口，监听本地端口`1323`。

1. 一个将输出`Hello, World!`
2. 随机输出一段长度等于10的字符串
3. 输出一段html表格(内容读取本地文件)

```go

package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	echoRandom "github.com/labstack/gommon/random"
	"io/ioutil"
	"net/http"
	"os"
)

func main() {
	// Echo instance
	e := echo.New()
	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	// Routes
	e.GET("/", hello)
	e.GET("/random", random)
	e.GET("/table", table)
	// Start server
	e.Logger.Fatal(e.Start(":1323"))
}

// Handler
func hello(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}
func random(c echo.Context) error {
	return c.String(http.StatusOK, echoRandom.String(10, echoRandom.Uppercase, echoRandom.Lowercase))
}
func table(c echo.Context) error {

	fs, _ := os.Open("./template/table.html")

	table, _ := ioutil.ReadAll(fs)
	html := string(table)
	return c.HTML(http.StatusOK, html)
}

```

完成代码之后，执行下`go mod vendor`，将代码依赖下载到`vendor`目录中。

**编译测试**

代码完成后，可以编译测试下接口。

```bash
meshell@k8s-microservice$ go build
meshell@k8s-microservice$ ./k8s-microservice
 ____    __
/ __/___/ /  ___
/ _// __/ _ \/ _ \
/___/\__/_//_/\___/ v4.1.5
High performance, minimalist Go web framework
https://echo.labstack.com
____________________________________O/_______
                                  O\
⇨ http server started on [::]:1323

```

测试下面三个地址:

1. http://127.0.0.1:1323/
2. http://127.0.0.1:1323/random
3. http://127.0.0.1:1323/table

#### 打包镜像

打包镜像需要自己有`hub.docker.com`的账号，下载`Docker`客户端登录其账号。在代码根目录新建`Dockerfile`文件，它是描述镜像构建流程的文本文件，编写一些特定的组合指令来完成。
你可以通过[这篇文章](https://loocode.com/post/10108)来了解怎么编写`Dockerfile`文件。

```dockerfile

FROM golang:1.12.7 

WORKDIR /go/src/project/

COPY . /go/src/project/
RUN go build -o /go/bin/k8s-microservice
EXPOSE 1323/tcp
ENTRYPOINT ["/go/bin/k8s-microservice"]

```

上面就是整个`Dockerfile`的完整内容。

**构建镜像**

通过`docker build`命令可以构建一个完整的镜像，之后通过`docker run`命令运行`docker`镜像。

```bash
meshell@k8s-microservice$ docker build -t k8s-microservice:lastet .
Sending build context to Docker daemon  22.15MB
Step 1/6 : FROM golang:1.12.7
 ---> be63d15101cb
Step 2/6 : WORKDIR /go/src/project/
 ---> Using cache
 ---> c2613edfead2
Step 3/6 : COPY . /go/src/project/
 ---> a42e4a1c96c5
Step 4/6 : RUN go build -o /go/bin/k8s-microservice
 ---> Running in ad280dcd951e
Removing intermediate container ad280dcd951e
 ---> c16dd3cf8c24
Step 5/6 : EXPOSE 1323/tcp
 ---> Running in d6b0ee26c004
Removing intermediate container d6b0ee26c004
 ---> b2f52c9c90e5
Step 6/6 : ENTRYPOINT ["/go/bin/k8s-microservice"]
 ---> Running in 29628dc95289
Removing intermediate container 29628dc95289
 ---> 6827bacf77de
Successfully built 6827bacf77de
Successfully tagged k8s-microservice:lastet


```

在`docker`环境运行镜像。将本地`1323`端口转发到容器中的`1323`端口。

```bash
meshell@k8s-microservice$ docker run -p 1323:1323 --rm k8s-microservice:lastet 

   ____    __
  / __/___/ /  ___
 / _// __/ _ \/ _ \
/___/\__/_//_/\___/ v4.1.5
High performance, minimalist Go web framework
https://echo.labstack.com
____________________________________O/_______
                                    O\
⇨ http server started on [::]:1323

```

现在又可以访问测试地址，只是这次程序布署在`docker`环境中而不是本地。

**推送镜像**

在`kubernetes`中创建`Deployment`是需要镜像名称的，我们需要把自己的镜像推送到`docker`镜像仓库中。

为镜像打上`tag`指定远程境像名称，使用`docker push`推送镜像。

```bash
meshell@k8s-microservice$ docker tag k8s-microservice  mfkgdyve/k8s-microservice:latest
meshell@k8s-microservice$ docker push  mfkgdyve/k8s-microservice:latest
```

推送完成之后可以查看`hub.docker.com`自己的`repository`。本境像的地址<https://cloud.docker.com/repository/docker/mfkgdyve/k8s-microservice>

#### 部署

部署到`kubernetes`之前我们需要创建对应的`Deployment`、`Service`、`Ingress`对象的配置文件。

- **Deployment**

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: echo-demo-deployment
spec:
  selector:
    matchLabels:
      app: echo-demo
  replicas: 3
  template:
    metadata:
      labels:
        app: echo-demo
    spec:
      containers:
      - name: k8s-microservice
        image: mfkgdyve/k8s-microservice:latest
        ports:
        - containerPort: 1323
```

通过`kubectl apply`创建部署:

```bash
meshell@k8s-microservice$ kubectl apply -f k8s-microservice-deployment.yaml
deployment.extensions/echo-demo-deployment created
```

创建建之后需要等待一段时间，从配置文件(`replicas: 3`)可以看到我们创建了三个副本(`Pods`)。

可以通过`kubectl get deployment echo-demo-deployment`或者`kubectl describe deployment echo-demo-deployment`查看`Deployment`的情况。

- **Service**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: echo-demo-service
spec:
  selector:
    app: echo-demo
  ports:
    - protocol: TCP
      port: 1323
      targetPort: 1323
```

以标签为`app=echo-demo`的`Pod`的TCP端口1323为目标对名为"echo-demo-service"的Endpoint对象进行POST更新。

通过`kubectl apply`创建服务:

```bash
meshell@k8s-microservice$ kubectl apply -f k8s-microservice-service.yaml
service/echo-demo-service created
```

通过`kubectl get service`查看服务:

```bash
meshell@k8s-microservice$ kubectl get service
NAME                TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
echo-demo-service   ClusterIP   10.98.119.95    <none>        1323/TCP  12s
kubernetes          ClusterIP   10.96.0.1       <none>        443/TCP   11d
nginx-service       ClusterIP   10.101.100.90   <none>        80/TCP    4d20h
```

- **Ingress**                     

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: echo-demo-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: \"false\"
spec:
  rules:
    - host: echo.demo
      http:
        paths:
        - path: /
          backend:
            serviceName: echo-demo-service
            servicePort: 1323
```

指host为`echo.demo`的请求访问到服务名`echo-demo-service`上面。

通过`kubectl apply`创建Ingress:

```bash
meshell@k8s-microservice$ kubectl apply -f k8s-microservice-ingress.yaml
ingress.extensions/echo-demo-ingress created
```

查看`Ingress`:

```bash
meshell@k8s-microservice$ kubectl get ingress
NAME                HOSTS        ADDRESS     PORTS   AGE
echo-demo-ingress   echo.demo                80      34s
nginx-ingress       loocode.de   10.0.2.15   80      4d20h
```

现在只需要把`echo.demo`绑定到集成ip就行了。我这里是本地集群环境使用`minikube ip`来获得ip。

```bash
meshell@k8s-microservice$ minikube ip
192.168.99.105
```

修改`/etc/hosts`文件将域名绑定到`ip`上。

```bash
192.168.99.105 echo.demo
```

![service-demo-1](https://image.loocode.com/upload/20190715/echo-demo-1.jpg)
![service-demo-2](https://image.loocode.com/upload/20190715/echo-demo-2.jpg)
![service-demo-3](https://image.loocode.com/upload/20190715/echo-demo-3.jpg)

整个部署过程已经完成，如果你想增加`Pods`你只需要加大`(replicas: 3)`配置就行了。可以将整个流程部署在公司内网实现一键发布，扩容，下架。
文章就到此为止了，如果你什么问题你可以在正文留言反馈。

#### 推荐阅读

1. <https://docs.docker.com/engine/reference/builder>
2. <https://kubernetes.io/docs/setup/learning-environment/minikube/>
3. <https://kubernetes.io/docs/concepts/services-networking/service/>
4. <https://kubernetes.io/docs/concepts/services-networking/ingress/>
5. [工程源码](https://github.com/TianLiangZhou/loocode-example/tree/master/k8s-microservice)


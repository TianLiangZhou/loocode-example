package main

import (
	"context"
	"flag"
	"fmt"
	"go-grpc/rpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	_ "google.golang.org/grpc/health"
	"google.golang.org/grpc/resolver"
	"google.golang.org/grpc/resolver/manual"
	"log"
	"time"
)

var (
	//addr          = flag.String("addr", "localhost:8080", "连接的服务地址")
	serviceConfig = `{
	"loadBalancingPolicy": "round_robin",
	"healthCheckConfig": {
		"serviceName": ""
	}
}`
)

func main() {
	flag.Parse()
	r := manual.NewBuilderWithScheme("authorization")
	r.InitialState(resolver.State{
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
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()
	// 创建一个服务客户端
	c := rpc.NewAuthorizationClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	// 调用服务中的接口 1
	res, err := c.Login(ctx, &rpc.LoginRequest{Email: "", Password: ""})
	if err != nil {
		log.Fatalf("Login error: %v", err)
	}
	log.Printf("Login message: %s", res.Message)

	// 调用服务中的接口 2
	res, err = c.Login(ctx, &rpc.LoginRequest{Email: "admin@admin.com", Password: "error password"})
	if err != nil {
		log.Fatalf("Login error: %v", err)
	}
	log.Printf("Login message: %s", res.Message)

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
}

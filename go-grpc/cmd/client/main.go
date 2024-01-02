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

}

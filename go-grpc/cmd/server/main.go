package main

import (
	"context"
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

func main() {
	flag.Parse()
	// 监听端口
	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))
	if err != nil {
		panic(fmt.Sprintf("failed to listen: %v", err))
	}
	// 创建rpc server
	s := grpc.NewServer()
	// 使用自动生成的代码
	//imp := rpc.UnimplementedAuthorizationServer{}
	// 使用自己的实现
	imp := rpcAuthorization{}
	// 注册RPC服务
	rpc.RegisterAuthorizationServer(s, imp)
	// 启动服务
	if err := s.Serve(listener); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

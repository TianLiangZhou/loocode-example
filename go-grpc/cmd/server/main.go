package main

import (
	"context"
	"flag"
	"fmt"
	"go-grpc/rpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/health"
	healthgrpc "google.golang.org/grpc/health/grpc_health_v1"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"
	"io"
	"log"
	"net"
	"net/http"
	"time"
)

var (
	port  = flag.Int("port", 8080, "服务监听端口")
	sleep = flag.Duration("sleep", time.Second*5, "duration between changes in health")

	system = "" // empty string represents the health of the system
)

type rpcAuthorization struct {
	rpc.UnimplementedAuthorizationServer
	svrState chan healthpb.HealthCheckResponse_ServingStatus
}

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
	r.svrState <- healthpb.HealthCheckResponse_NOT_SERVING
	return &rpc.LoginResponse{
		Message: "邮箱或密码错误",
	}, nil
}

func (r *rpcAuthorization) mustEmbedUnimplementedAuthorizationServer() {
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
	// 创建健康检查server
	healthSvr := health.NewServer()
	// 注健康检查server册
	healthgrpc.RegisterHealthServer(s, healthSvr)
	// 使用自动生成的代码
	//imp := rpc.UnimplementedAuthorizationServer{}
	// 使用自己的实现
	state := make(chan healthpb.HealthCheckResponse_ServingStatus, 1)
	imp := &rpcAuthorization{svrState: state}
	// 注册RPC服务
	rpc.RegisterAuthorizationServer(s, imp)

	go func() {
		next := healthpb.HealthCheckResponse_SERVING
		for {
			healthSvr.SetServingStatus(system, next)
			log.Printf("change state: %d\n", next)
			next = <-state
			time.Sleep(*sleep)
		}
	}()
	go func() {
		mux := http.NewServeMux()
		mux.HandleFunc("/update", func(writer http.ResponseWriter, request *http.Request) {
			state <- healthpb.HealthCheckResponse_SERVING
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
	// 启动服务
	if err := s.Serve(listener); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

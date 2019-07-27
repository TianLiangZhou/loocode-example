FROM golang:1.12.7

WORKDIR /go/src/project/

COPY . /go/src/project/
RUN go build -o /go/bin/k8s-microservice
EXPOSE 1323/tcp
ENTRYPOINT ["/go/bin/k8s-microservice"]

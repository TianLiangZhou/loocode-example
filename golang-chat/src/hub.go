// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"github.com/mediocregopher/radix/v3"
	"log"
)

var redisPool = redisInitialize()

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

type Channel struct {
	channel map[string]*Hub
}

func (c *Channel) run() {
	for _, hub := range c.channel {
		go hub.run()
	}
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func channelInstance() *Channel {
	var channelMap map[string]string
	err := redisPool.Do(radix.Cmd(&channelMap, "HGETALL", "chat:channel"))
	if err != nil {
		log.Println("连接失败, 聊天频道未定义")
		panic("连接失败, 聊天频道列表为空")
	}
	if len(channelMap) == 0 {
		log.Println("聊天频道未定义")
		panic("聊天频道列表为空")
	}
	channel := &Channel{channel: make(map[string]*Hub)}
	for channelName := range channelMap {
		channel.channel[channelName] = newHub()
	}
	return channel
}

func redisInitialize() *radix.Pool {
	pool, err := radix.NewPool("tcp", "127.0.0.1:6379", 10)
	if err != nil {
		log.Printf("redisPool read error, %v", err)
		panic(err)
	}
	return pool
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}
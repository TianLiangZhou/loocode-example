<?php
namespace Chat\Server;

use Swoole\Websocket\Server as WebSocket;
use Swoole\Websocket\Frame;
use Swoole\Http\Request;

class WebSocketServer
{
    private $socket = null;

    private $config = [
        'host' => '0.0.0.0',
        'port' => 9527,
    ];

    public function __construct(array $config = [])
    {
        foreach ($config as $key => $value) {
            if (array_key_exists($key, $this->config)) {
                $this->config[$key] = $value;
            }
        }
        $this->initialize();
    }

    private function initialize()
    {
        $this->socket = new WebSocket($this->config['host'], $this->config['port']);
        
        foreach (['open', 'message', 'close'] as $callback) {
            # code...
            $this->socket->on($callback, [$this, $callback]);
        }
    }

    public function getConnections()
    {
        return $this->socket->connections;
    }

    public function open(WebSocket $server, Request $request)
    {
        echo $request->fd . '--open';        
    }

    public function close(WebSocket $server, $fd)
    {
        echo "$fd--close";
    }

    public function run()
    {
        $this->socket->start();
    }
}
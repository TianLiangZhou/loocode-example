<?php
namespace Chat\Server;

use Swoole\Websocket\Server as WebSocket;
use Swoole\Websocket\Frame;

class ChatServer extends WebSocketServer
{
    private $message = '';

    private $online = 0;

    public function message(WebSocket $server, Frame $frame)
    {   

        $message = '';
        if ($frame->data == "new user") {
            $this->online++;
        } else {
            $this->message .= $frame->data;
            if ($frame->finish) {
                $message = $this->message;
                $this->message = '';
                foreach ($this->getConnections() as $fd) {
                    if ($frame->fd === $fd) continue;
                    $server->push($fd, $message);
                }
            }        
        }
    }

    public function close(WebSocket $server, $fd)
    {
        $this->online--;
        echo "$fd--close";
    }
}
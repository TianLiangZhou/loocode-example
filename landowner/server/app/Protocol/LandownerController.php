<?php

namespace Landowner\Protocol;

use Pimple\Psr11\Container;
use Surf\Mvc\Controller\WebSocketController;
use Surf\Server\RedisConstant;

class LandownerController extends WebSocketController
{
    const READY_KEY = 'ready:action';

    /**
     * @var null | \Redis
     */
    protected $redis = null;

    /**
     * LandownerController constructor.
     * @param Container $container
     * @param int $workerId
     */
    public function __construct(Container $container, $workerId = 0)
    {
        parent::__construct($container, $workerId);

        $this->redis = $this->container->get('redis');
    }

    /**
     * @param $body
     * @return array
     */
    public function enterRoom($body)
    {
        echo $this->frame->fd;
        $count = $this->redis->sCard(RedisConstant::FULL_CONNECT_FD);
        $flag = 0;
        $players = [];
        if ($count > 3) {
            $flag = 500;
        } else {
            $allPlayer = $this->redis->sMembers(RedisConstant::FULL_CONNECT_FD);
            foreach ($allPlayer as $fd) {
                if ($fd == $this->frame->fd) {
                    continue;
                }
                $readyState = $this->redis->hGet(self::READY_KEY, $fd);
                $players[]['ready'] = $readyState;
            }

        }
        return [
            "flag" => $flag,
            "player" => $players,
            "requestId" => $body->requestId,
            "close"=> $flag > 0 ? true : false
        ];
    }

    /**
     * @param $body
     * @return array
     */
    public function roomPlayer($body)
    {
        $count = $this->redis->sCard(RedisConstant::FULL_CONNECT_FD);
        $player = $this->redis->sMembers(RedisConstant::FULL_CONNECT_FD);
        $players = [];
        foreach ($player as $fd) {
            if ($fd == $this->frame->fd) {
                continue;
            }
            $readyState = $this->redis->hGet(self::READY_KEY, $fd);
            $players[]['ready'] = $readyState;
        }
        return [
            "flag"   => 0,
            "count" => $count,
            "player" => $players,
            "requestId" => $body->requestId,
        ];
    }

    /**
     * @param $body
     * @return array
     */
    public function ready($body)
    {
        if (!$this->redis->sIsMember(RedisConstant::FULL_CONNECT_FD, $this->frame->fd)) {
            return [
                "flag" => 500,
                "requestId" => $body->requestId,
            ];
        }

        $ready = 1;
        if (isset($body->ready)) {
            $ready = (int) $body->ready;
        }
        $this->redis->hSet(self::READY_KEY, $this->frame->fd, $ready);
        return [
            "flag" => 0,
            "requestId" => $body->requestId,
        ];
    }
}
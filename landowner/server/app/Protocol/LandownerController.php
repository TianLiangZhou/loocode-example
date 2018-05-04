<?php

namespace Landowner\Protocol;

use Pimple\Psr11\Container;
use Surf\Mvc\Controller\WebSocketController;
use Surf\Server\RedisConstant;
use Surf\Task\PushTaskHandle;

class LandownerController extends WebSocketController
{
    const READY_KEY = 'ready:action';

    /**
     * @var null | \Redis
     */
    protected $redis = null;

    const PLAYER_INFO = 'player:%d'; //每局的信息

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
        $count = $this->redis->sCard(RedisConstant::FULL_CONNECT_FD);
        $flag = 0;
        $players = [];
        if ($count > 3) {
            $flag = 500;
            $this->setIsClose(true);
        } else {
            $allPlayer = $this->redis->sMembers(RedisConstant::FULL_CONNECT_FD);
            print_r($allPlayer);
            $otherPlayer = array_diff($allPlayer, [$this->frame->fd]);
            if ($otherPlayer) {
                foreach ($otherPlayer as $fd) {
                    $readyState = $this->redis->hGet(self::READY_KEY, $fd);
                    $players[] = [
                        'ready' => $readyState,
                        'playerId' => $fd,
                    ];
                }
                $this->task([
                    "from" => $otherPlayer,
                    "content" => json_encode([
                        "listen" => "enterRoom",
                        "content" => $this->frame->fd,
                    ])
                ], PushTaskHandle::class);
            }
        }
        return [
            "flag" => $flag,
            "player" => $this->frame->fd,
            "otherPlayer" => $players,
            "requestId" => $body->requestId,
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
            $players[] =[
                'ready' => $readyState,
                'playerId'=> $fd,
            ];
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

        $ready = 0;
        if (isset($body->ready)) {
            echo "ready";
            $ready = (int) $body->ready;
        }
        $this->redis->hSet(self::READY_KEY, $this->frame->fd, $ready);

        $count = $this->redis->sCard(RedisConstant::FULL_CONNECT_FD);
        if ($count >= 2) {
            $players = $this->redis->sMembers(RedisConstant::FULL_CONNECT_FD);
            $otherPlayer = [];
            foreach ($players as $player) {
                if ($player == $this->frame->fd) {
                    continue;
                }
                $otherPlayer[] = $player;
            }
            $this->task([
                'from' => $otherPlayer,
                'content' => json_encode(["listen" => "readyStatus", "content" => [
                    'playerId' => $this->frame->fd,
                    'ready'  => $ready,
                ]])
            ], PushTaskHandle::class);

            if ($count >= 3) {
                $status = 1;
                foreach ($players as $player) {
                    $status = $status & (int)$this->redis->hGet(self::READY_KEY, $player);
                }
                if ($status) { //全部准备
                    $playerInfo = $this->poker($players);
                    $playerPoker = $playerInfo['poker'];
                    unset($playerInfo['poker']);
                    foreach ($players as $player) {
                        $playerInfo['poker'] = $playerPoker[$player];
                        $this->task([
                            'from' => $player,
                            'content' => json_encode(["listen" => "assignPoker", "content" => $playerInfo])
                        ], PushTaskHandle::class);
                    }
                }
            }
        }
        return [
            "flag" => 0,
            "requestId" => $body->requestId,
        ];
    }


    public function grabLandowner()
    {

    }

    public function putPoker()
    {

    }

    /**
     * @param array $player
     * @return array
     */
    private function poker(array $player)
    {
        $playId = mt_rand(100, 1000000); //局号

        $poker = range(1, 54);

        shuffle($poker);
        shuffle($poker);
        shuffle($poker);

        $landowner = [];

        for ($i = 1; $i <= 3; $i++) {
            $key = array_rand($poker, 1);
            $landowner[] = $poker[$key];
            unset($poker[$key]);
        }

        $playerPoker = [];
        foreach (array_chunk($poker, 3) as $value) {
            $playerPoker[$player[0]][] = $value[0];
            if (isset($value[1])) {
                $playerPoker[$player[1]][] = $value[1];
            }
            if (isset($value[2])) {
                $playerPoker[$player[2]][] = $value[2];
            }
        }

        $this->redis->hSet(sprintf(self::PLAYER_INFO, $playId), 'poker', json_encode($playerPoker));
        $this->redis->hSet(sprintf(self::PLAYER_INFO, $playId), 'luck_poker', json_encode($landowner));

        return [
            'playId' => $playId,
            'poker'  => $playerPoker,
            'landowner' => $landowner,
        ];
    }
}
<?php

use Landowner\HeartbeatTicker;
use Landowner\Protocol\LandownerController;
use Surf\Event\ServerCloseEvent;
use Surf\Provider\RedisServiceProvider;

require __DIR__ . '/vendor/autoload.php';


$config = [];

$config['setting'] = [
    'document_root' => __DIR__,
    'task_worker_num' => 1,
];
$config['server'] = 'webSocket';
//$config['is_open_http'] = true;

$app = new \Surf\Application(__DIR__, [
    'app.config' => $config
]);

$app->addTicker(1000, HeartbeatTicker::class)->register(
    new RedisServiceProvider()
);
//监听close 事件，删除对应的准备信息
$app->on(Surf\Server\Events::SERVER_CLOSE, function (ServerCloseEvent $event) use ($app) {

    /**
     * @var $redis \Redis
     */
    $redis = $app->get('redis');

    $redis->hDel(LandownerController::READY_KEY, $event->getFd());
    echo "clear fd:", $event->getFd(), "\n";

});

include __DIR__ . '/protocol.php';

try {
    $app->run();
} catch (\Surf\Exception\ServerNotFoundException $e) {

}
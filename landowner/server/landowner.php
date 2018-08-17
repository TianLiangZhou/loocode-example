<?php

use Landowner\HeartbeatTicker;
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

include __DIR__ . '/protocol.php';

try {
    $app->run();
} catch (\Surf\Exception\ServerNotFoundException $e) {

}
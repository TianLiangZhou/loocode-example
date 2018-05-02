<?php

require __DIR__ . '/vendor/autoload.php';


$config = [];

$config['server'] = 'webSocket';
//$config['is_open_http'] = true;
$config['setting']['document_root'] = __DIR__;

$app = new \Surf\Application(__DIR__, [
    'app.config' => $config
]);

$app->register(new \Surf\Provider\RedisServiceProvider());

include __DIR__ . '/protocol.php';

try {
    $app->run();
} catch (\Surf\Exception\ServerNotFoundException $e) {

}
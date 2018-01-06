<?php

require __DIR__ . '/vendor/autoload.php';

use Hummer\Event;
use Hummer\RequestListener;
$app = new Hummer\Application();

$app->on(Event::REQUEST, function($event) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        //$event->setResponse('不允许GET请求');
    }
});

$app->on(Event::CONTROLLER, function($event) {
    $event->setMethod(
        $event->getMethod() . 'Action'
    );
});

$app->on(Event::RESPONSE, function($event) {
    $event->setResponse(
        strtoupper($event->getResponse())
    );
});

$app->subscriber(new RequestListener());

try {
    echo $app->run();
} catch(Exception $e) {
    echo $e->getMessage();
}
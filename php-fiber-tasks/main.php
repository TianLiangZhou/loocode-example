<?php
$fiber = new \Fiber(function (): string {
    $value = \Fiber::suspend('fiber');
    echo "Value used to resume fiber: ", $value, PHP_EOL;

    return "Return Response";
});

$value = $fiber->start();

echo "Value from fiber suspending: ", $value, PHP_EOL;

$fiber->resume('test');

echo $fiber->getReturn();

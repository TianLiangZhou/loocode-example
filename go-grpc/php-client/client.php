<?php

include __DIR__ . "/vendor/autoload.php";

$hostname = "localhost:8080";

$client = new Proto\AuthorizationClient($hostname, [
    'credentials' => Grpc\ChannelCredentials::createInsecure(),
]);
$request = new Proto\LoginRequest();
$request->setEmail("");
$request->setPassword("");
list($response, $status) = $client->Login($request)->wait();
if ($status->code !== Grpc\STATUS_OK) {
    echo "ERROR: " . $status->code . ", " . $status->details . PHP_EOL;
    exit(1);
}
echo $response->getMessage() . PHP_EOL;

$request = new Proto\LoginRequest();
$request->setEmail("admin@admin.com");
$request->setPassword("admin");
list($response, $status) = $client->Login($request)->wait();
if ($status->code !== Grpc\STATUS_OK) {
    echo "ERROR: " . $status->code . ", " . $status->details . PHP_EOL;
    exit(1);
}
echo $response->getMessage() . PHP_EOL;

$request = new Proto\LoginRequest();
$request->setEmail("admin@admin.com");
$request->setPassword("123456");
list($response, $status) = $client->Login($request)->wait();
if ($status->code !== Grpc\STATUS_OK) {
    echo "ERROR: " . $status->code . ", " . $status->details . PHP_EOL;
    exit(1);
}
echo $response->getMessage() . PHP_EOL;

var_dump($response->getUser());


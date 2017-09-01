<?php
include __DIR__ . '/../vendor/autoload.php'; 

use Chat\Server\ChatServer;

$chat = new ChatServer();

$chat->run();
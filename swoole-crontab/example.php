<?php

$time = date('Y-m-d H:i:s');

file_put_contents("crontab.txt", $time . "\r\n", FILE_APPEND);


<?php

function readDirFiles(string $dir)
{
    $files = [];
    foreach (new DirectoryIterator($dir) as $item){
        $files[] = $item->getFilename();
        Fiber::suspend();
    }
    return $files;
}

function createVideoClip(string $cmd) : string {
    $stdout = fopen('php://temporary', 'w+');
    $stderr = fopen('php://temporary', 'w+');
    $streams = [
        0 => ['pipe', 'r']
        , 1 => $stdout
        , 2 => $stderr
    ];

    $proc = proc_open($cmd, $streams, $pipes);
    if (!$proc){
        throw new \RuntimeException('Unable to launch download process');
    }

    do {
        // Wait 1ms before checking
        // usleep(1000);
        Fiber::suspend();
        $status = proc_get_status($proc);
    } while ($status['running']);

    proc_close($proc);
    fclose($stdout);
    fclose($stderr);
    $success = $status['exitcode'] === 0;
    if ($success){
        return "finish";
    } else {
        throw new \RuntimeException('Unable to perform conversion');
    }
}



//var_dump(readDirFiles(__DIR__));

//var_dump(readDirFiles('.'));

//
//$response = [];
//$start = microtime(true);
//echo "before time to: ", $start, PHP_EOL;
//$https = [
//    'baidu' => 'https://www.baidu.com/',
//    'sina' => 'https://www.sina.com.cn/',
//    '163' => 'https://www.163.com/',
//    'toutiao' => 'https://www.toutiao.com/',
//    'qq' => 'https://www.qq.com/',
//    'news' => 'http://www.xinhuanet.com/',
//];
//foreach ($https as $key => $url) {
//    $response[$key] = file_get_contents($url);
//}
//$end =  microtime(true);
//echo "end time to: ", $end - $start, PHP_EOL;
//
//
//$start = microtime(true);
//echo "before time to: ", $start, PHP_EOL;
//$fibers = [];
//foreach ($https as $key => $http) {
//    $fiber = new Fiber(function (string $url) {
//        Fiber::suspend();
//        return file_get_contents($url);
//    });
//    $fiber->start($http);
//    $fibers[] = $fiber;
//}
//
//while ($fibers){
//    foreach ($fibers as $idx => $fiber){
//        if ($fiber->isTerminated()) {
//            $files[$idx] = $fiber->getReturn();
//            unset($fibers[$idx]);
//        } else {
//            $fiber->resume();
//        }
//    }
//}
//$end =  microtime(true);
//echo "end time to: ", $end - $start, PHP_EOL;



$cmds = [
    'ffmpeg -threads 1 -i /Users/meshell/Downloads/weibo.mp4 -t 30 -crf 26 -c:v h264 -c:a ac3 /Users/meshell/Downloads/test1.mp4',
    'ffmpeg -threads 1 -i /Users/meshell/Downloads/weibo.mp4 -t 30 -crf 26 -c:v h264 -c:a ac3 /Users/meshell/Downloads/test2.mp4',
    'ffmpeg -threads 1 -i /Users/meshell/Downloads/weibo.mp4 -t 30 -crf 26 -c:v h264 -c:a ac3 /Users/meshell/Downloads/test3.mp4',
    'ffmpeg -threads 1 -i /Users/meshell/Downloads/weibo.mp4 -t 30 -crf 26 -c:v h264 -c:a ac3 /Users/meshell/Downloads/test4.mp4',
    'ffmpeg -threads 1 -i /Users/meshell/Downloads/weibo.mp4 -t 30 -crf 26 -c:v h264 -c:a ac3 /Users/meshell/Downloads/test5.mp4',
    'ffmpeg -threads 1 -i /Users/meshell/Downloads/weibo.mp4 -t 30 -crf 26 -c:v h264 -c:a ac3 /Users/meshell/Downloads/test6.mp4',
];

$start = microtime(true);
echo "before time to: ", $start, PHP_EOL;

$fibers = [];
foreach ($cmds as $cmd) {
    $fiber = new Fiber(createVideoClip(...));
    $fiber->start($cmd);
    $fibers[] = $fiber;
}

while ($fibers){
    foreach ($fibers as $idx => $fiber){
        if ($fiber->isTerminated()) {
            echo $fiber->getReturn(), PHP_EOL;
            unset($fibers[$idx]);
        } else {
            $fiber->resume();
        }
    }
}

$end =  microtime(true);
echo "end time to: ", $end - $start, PHP_EOL;





//
//
//
//var_dump($files);

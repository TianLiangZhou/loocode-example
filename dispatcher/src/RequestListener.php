<?php
namespace Hummer;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;


class RequestListener implements EventSubscriberInterface
{
    public function onRequestEvent($event)
    {
        echo "我是订阅的事件";
    }

    /**
     * 实现方法
     */
    public static function getSubscribedEvents()
    {
        return [
            Event::REQUEST => ["onRequestEvent", -100]
        ];
    }
}
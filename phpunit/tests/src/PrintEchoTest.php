<?php


namespace Test;


use PHPUnit\Framework\TestCase;

class PrintEchoTest extends TestCase
{
    public function testPrint()
    {
        $this->expectOutputString('foo');
        print 'foo';
    }

    public function testEcho()
    {
        $this->expectOutputString('hell');
        echo "hello";
    }
}

<?php


namespace Test;


use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class ExceptionTest extends TestCase
{
    public function testException()
    {
        $this->expectException(InvalidArgumentException::class);
    }

    /**
     * @expectedException InvalidArgumentException
     */
    public function testAException()
    {
        throw new InvalidArgumentException("无效的参数", 500);
    }
}

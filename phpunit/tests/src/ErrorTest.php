<?php


namespace Test;


use PHPUnit\Framework\Error\Error;
use PHPUnit\Framework\TestCase;

class ErrorTest extends TestCase
{
    /**
     * @expectedException Error
     */
    public function testNotFile()
    {
        include "not.file.php";
    }
}

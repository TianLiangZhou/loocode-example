<?php

namespace Test;

use PHPUnit\Framework\TestCase;

/**
 * Class AssertTest
 * @package Test`
 */
class AssertTest extends TestCase
{
    /**
     *
     */
    public function testDataType()
    {
        $this->assertIsInt(11); // 测试变量不是整型
        $this->assertIsArray([]); // 测试变量不是数组
        $this->assertIsFloat(1.1); // 测试变量不是符点型
        $this->assertIsBool(false); // 测试变量不是bool类型
        $this->assertIsCallable(function() {}); // 测试变量不是闭包
        $this->assertIsIterable(new \stdClass()); // 测试变量不是迭代器
    }

    /**
     *
     */
    public function testEqual()
    {
        $base = 111;
        $this->assertEquals($base, 2222); // 测试相等性
    }

    public function testContains()
    {
        $haystack = "test string contains";
        $this->assertContains("test", $haystack); // 测试字符包含关系
    }

    /**
     *
     */
    public function testArray()
    {
        $hash = [
            'body' => "hello world"
        ];
        $key = 'body';
        $this->assertArrayHasKey($key, $hash); // 测试key是否存在
    }
}

<?php

namespace App;

class Coverage
{
    public function add()
    {
        return 1 + 1;
    }

    public function sub()
    {
        return 2 - 1;
    }

    public function div()
    {
        return 4 / 2;
    }

    public function mul()
    {
        return 2 * 2;
    }

    public function find(array $sort, int $find)
    {
        return $this->binarySearch($sort, $find);
    }

    public function binarySearch(array $sort, $find)
    {
        $low = 0;
        $high = count($sort) - 1;

        while ($low <= $high) {
            $mid = (int) floor(($low + $high) / 2);
            if($sort[$mid] == $find) {
                return true;
            }
            if ($find < $sort[$mid]) {
                $high = $mid -1;
            } else {
                $low = $mid + 1;
            }
        }
        return false;
    }
}

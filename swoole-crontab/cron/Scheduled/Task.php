<?php
namespace Cron\Scheduled;

define('FIRST_MIN', 0);
define('LAST_MIN', 59);
define('FIRST_HOUR', 0);
define('LAST_HOUR', 23);
define('FIRST_DAY', 1);
define('LAST_DAY', 31);
define('FIRST_MONTH', 1);
define('LAST_MONTH', 12);
define('FIRST_WEEK', 0);
define('LAST_WEEK', 6);

use Symfony\Component\Process\Process;

class Task
{
    private $taskString;

    private $min;

    private $hour;

    private $day;

    private $month;

    private $week;

    private $command;

    private $process;

    private $runTime;

    /**
     * @var string $taskString example: 10 * * * * php example.php
     */
    public function __construct(string $taskString)
    {
        $this->taskString = $taskString;
        $this->runTime = time();
        $this->initialize();
    }

    /**
     * 初始化任务配置
     */
    private function initialize()
    {
        //过滤多余的空格
        $rule = array_filter(explode(" ", $this->taskString), function($value) {
            return $value != "";
        });
        if (count($rule) < 7) {
            throw new \ErrorException("'taskString' parse failed");
        }
        $this->min = $this->format($rule[0], 'min');
        $this->hour= $this->format($rule[1], 'hour');
        $this->day = $this->format($rule[2], 'day');
        $this->month = $this->format($rule[3], 'month');
        $this->week= $this->format($rule[4], 'week');
        $this->command = array_slice($rule, 5);
    }

    private function format($value, $field)
    {
        if ($value === '*') {
            return $value;
        }
        if (is_numeric($value)) {
            return [$this->checkFieldRule($value, $field)];
        }
        $steps = explode(',', $value);
        $scope = [];
        foreach ($steps as $step) {
            if (strpos($step, '-') !== false) {
                $range = explode('-', $step);
                $scope = array_merge($scope, range(
                    $this->checkFieldRule($range[0], $field),
                    $this->checkFieldRule($range[1], $field)
                ));
                continue;
            }
            if (strpos($step, '/') !== false) {
                $inter = explode('/', $step);
                $confirmInter = isset($inter[1]) ? $inter[1] : $inter[0];
                if ($confirmInter === '/') {
                    $confirmInter = 1; 
                }
                $scope = array_merge($scope, range(
                    constant('FIRST_' . strtoupper($field)),
                    constant('LAST_' . strtoupper($field)),
                    $confirmInter
                ));
                continue;
            }
            $scope[] = $step;
        }
        return $scope;
    }

    private function checkFieldRule($value, $field)
    {
        $first = constant('FIRST_' . strtoupper($field));
        $last  = constant('LAST_' . strtoupper($field));
        if ($value < $first) {
            return $first;
        }
        if ($value > $last) {
            return $last;
        }
        return (int) $value;
    }

    public function getTimeAttribute($attribute)
    {
        if (!in_array($attribute, ['min', 'hour', 'day', 'month', 'week', 'runTime'])) return null;
        return $this->{$attribute} ?? null;
    }

    public function setRunTime($time)
    {
        $this->runTime = $time;
    }

    public function run()
    {
        if (null === $this->process) {
            $this->process = new Process(implode(" ", $this->command));
        }
        //异步执行命令
        $this->process->start();
    }
}
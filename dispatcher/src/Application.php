<?php

namespace Hummer {

    use Symfony\Component\EventDispatcher\EventDispatcher;
    use Symfony\Component\EventDispatcher\Event AS EventAlias;
    use Symfony\Component\EventDispatcher\EventSubscriberInterface;

    class Event
    {
        const REQUEST = 'request';
        const RESPONSE = 'response';
        const VIEW = 'VIEW';
        const CONTROLLER = 'controller';
    }

    class GetResponseEvent extends EventAlias
    {
        protected $response = null;

        public function __construct()
        {

        }
        
        public function setResponse($response)
        {
            $this->response = $response;
        }

        public function getResponse()
        {
            return $this->response;
        }

        public function hasResponse()
        {
            return $this->response !== null;
        }
    }

    class FinishResponseEvent extends GetResponseEvent
    {
        public function __construct($response)
        {
            $this->setResponse($response);
        }
    }
    class ViewResponseEvent extends GetResponseEvent
    {
        public function __construct($response)
        {
            $this->setResponse($response);
        }
    }



    class ControllerEvent extends EventAlias
    {
        private $controllerSchema = null;

        private $controller = null;

        private $method = null;

        public function __construct($controllerSchema)
        {
            $this->controllerSchema = $controllerSchema;
            list($controller, $method) = explode(':', $this->controllerSchema);
            $this->setMethod($method);
            foreach (explode('.', $controller) as $namespaceController) {
                $this->controller .= "\\" . ucfirst($namespaceController);
            }
        }

        public function getController()
        {
            return $this->controller;
        }

        public function getMethod()
        {
            return $this->method;
        }

        public function setMethod($method)
        {
            $this->method = $method; 
        }
    }



    class Application
    {

        protected $dispatcher = null;

        public function __construct()
        {
            $this->dispatcher = new EventDispatcher();
        }

        public function run()
        {
            
            $event = new GetResponseEvent();
            //触发请求事件
            $this->dispatcher->dispatch(Event::REQUEST, $event);
            //检测事件的response有没有被设置，比如不允许GET请求
            if ($event->hasResponse()) {
                return $this->finishResponse($event->getResponse());
            }
            //获取控制器，这里也可以用path_info来设置，比如/index/index等等，这里我们就不涉及路由这个了
            $controller = $_GET['c'] ?? null;
            if (empty($controller)) {
                throw new \Exception("Undefined controller");                
            }
            //通过事件解析controller, 控制器规则：hummer.controllers.index:index 或 index:index(前面是命名空间)
            $event = new ControllerEvent($controller);
            $this->dispatcher->dispatch(Event::CONTROLLER, $event);
            
            $controller = $event->getController();
            $method     = $event->getMethod();
            //执行方法
            $response = call_user_func([new $controller, $method]);
            
            //执行视图事件
            if (is_object($response)) {
                $event = new ViewResponseEvent($response);
                $this->dispatcher->dispatch(Event::VIEW, $event);
                $response = $event->getResponse();
            }            
            //执行response完成事件
            return $this->finishResponse($response);
        }

        //执行完成事件
        private function finishResponse($response)
        {
            $event = new FinishResponseEvent($response);
            $this->dispatcher->dispatch(Event::RESPONSE, $event);
            return $event->getResponse();
        }

        //监听事件
        public function on($name, $callback, $sort = 0)
        {
            $this->dispatcher->addListener($name, $callback, $sort);
        }

        /**
         * 订阅事件
         */
        public function subscriber(EventSubscriberInterface $subscriber)
        {
            $this->dispatcher->addSubscriber($subscriber);
        }
    }

}
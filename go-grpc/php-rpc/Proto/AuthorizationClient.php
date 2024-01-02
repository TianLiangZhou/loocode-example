<?php
// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// 版本
namespace Proto;

/**
 */
class AuthorizationClient extends \Grpc\BaseStub {

    /**
     * @param string $hostname hostname
     * @param array $opts channel options
     * @param \Grpc\Channel $channel (optional) re-use channel object
     */
    public function __construct($hostname, $opts, $channel = null) {
        parent::__construct($hostname, $opts, $channel);
    }

    /**
     * 登录rpc接口
     * @param \Proto\LoginRequest $argument input argument
     * @param array $metadata metadata
     * @param array $options call options
     * @return \Grpc\UnaryCall
     */
    public function Login(\Proto\LoginRequest $argument,
      $metadata = [], $options = []) {
        return $this->_simpleRequest('/proto.Authorization/Login',
        $argument,
        ['\Proto\LoginResponse', 'decode'],
        $metadata, $options);
    }

}

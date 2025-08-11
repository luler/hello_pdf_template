<?php

namespace app\common\traits;

/*
@param string $message 获取返回提示语
 */

trait ApiReturn
{
    //返回提示语
    private $returnMessage = 'system error';
    //返回码
    private $returnCode = '500';
    //返回数据列表
    private $returnInfo = [];
    //异步执行任务
    private $backgroundTask = null;
    //异步执行任务
    public $close_log = false;

    private function setReturnMessage($message)
    {
        $this->returnMessage = $message;
        return $this;
    }

    private function setReturnCode($code)
    {
        $this->returnCode = $code;
        return $this;
    }

    private function setReturnInfo($data = [])
    {
        $this->returnInfo = $data;
        return $this;
    }

    public function setBackgroundTask($backgroundTask)
    {
        $this->backgroundTask = $backgroundTask;
        return $this;
    }

    /**
     * 成功返回操作，已默认code=200
     * @param string $message
     * @param array $info
     * @return \think\response\Json|\think\response\Jsonp
     */
    public function successResponse($message = 'success', $info = [])
    {
        return $this->setReturnCode(200)->setReturnMessage($message)->setReturnInfo($info)->returnDo();
    }

    /**
     * 资源创建成功返回
     * Author:我只想看看蓝天<1207032539@qq.com>
     * @param string $message
     * @param array $info
     * @return \think\response\Json|\think\response\Jsonp
     */
    public function createdResponse($message = 'success', $info = [])
    {
        return $this->setReturnCode(201)->setReturnMessage($message)->setReturnInfo($info)->returnDo();
    }

    /**
     * 资源删除后无内容返回
     * Author:我只想看看蓝天<1207032539@qq.com>
     * @param string $message
     * @param array $info
     * @return \think\response\Json|\think\response\Jsonp
     */
    public function noContentResponse()
    {
        return $this->setReturnCode(204)->returnDo();
    }

    /**
     * 常规失败返回操作，已默认code=400
     * @param string $message 提示语
     * @param array $info 返回数据
     * @return \think\response\Json|\think\response\Jsonp
     */
    public function errorResponse($message = 'error', $info = [])
    {
        return $this->setReturnCode(400)->setReturnMessage($message)->setReturnInfo($info)->returnDo();
    }

    /**
     * 通用返回
     * Author:我只想看看蓝天<1207032539@qq.com>
     * @param int $code
     * @param string $message
     * @param array $info
     * @return \think\response\Json|\think\response\Jsonp
     */
    public function commonResponse($code = 200, $message = 'success', $info = [])
    {
        return $this->setReturnCode($code)->setReturnMessage($message)->setReturnInfo($info)->returnDo();
    }

    /**
     * exit方式返回数据
     * 常见在初始化_initialize()方法使用
     * @param string $code
     * @param string $message
     * @param array $info
     * @return mixed
     */
    public function exitResponse($code = 500, $message = 'error', $info = [])
    {
        return $this->setReturnCode($code)->setReturnMessage($message)->setReturnInfo($info)->returnDo();
    }

    /**
     * 返回接口数据
     * @return \think\response\Json|\think\response\Jsonp
     */
    public function returnDo()
    {
        //设置返回内容
        $return = [
            'message' => $this->returnMessage,
            'code' => (int)$this->returnCode,
            'info' => $this->returnInfo
        ];
        //设置http返回码
        http_response_code($this->returnCode);
        if (!in_array($this->returnCode, [204])) {
            header('Content-Type:application/json; charset=utf-8');
            echo json_encode($return, 256);
        }
        //请求终止返回
        fastcgi_finish_request();
        //执行投递的异步后台任务
        if (is_callable($this->backgroundTask)) {
            $backgroundTask = $this->backgroundTask;
            $backgroundTask();
        }
        exit();
    }
}

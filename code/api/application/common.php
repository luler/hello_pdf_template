<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2016 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 流年 <liu21st@gmail.com>
// +----------------------------------------------------------------------

/**
 * 判断登陆，获取uid
 * @return bool|mixed
 * @author 我只想看看蓝天 <1207032539@qq.com>
 */
function is_login()
{
    //返回登录用户的uid
    if (request()->__uid__) {
        return request()->__uid__;
    } else {
        try {
            $authInfo = \app\common\tools\JwtTools::instance()->authenticate();
            return $authInfo['uid'];
        } catch (\Exception $e) {
            return false;
        }
    }
}

/**
 * 检查数据
 * @param $param
 * @param $rule
 * @param $message
 * @throws CommonException
 * @author 我只想看看蓝天 <1207032539@qq.com>
 */
function checkData($param, $rule, $message = [])
{
    $check = \think\Validate::make($rule, $message);
    if (!$check->check($param)) {
        throw new \app\common\exception\CommonException($check->getError());
    }
}

/**
 * 获取随机头像
 * @param null $id
 * @return string
 * @author 我只想看看蓝天 <1207032539@qq.com>
 */
function generateAvatar($id = null)
{
    $multiavatar = new \Multiavatar();
    $id = is_null($id) ? session_create_id() : $id;
    $svgCode = $multiavatar($id, null, null);
    $url = '/backend/avatar/' . md5($id) . '.svg';
    $filename = app()->getRootPath() . 'public' . $url;
    file_put_contents($filename, $svgCode);
    return $url;
}

/**
 * 保存外部图片到本地
 * @param $image_url
 * @param null $image_name
 * @return false|string
 * @author 我只想看看蓝天 <1207032539@qq.com>
 */
function save_outer_image($image_url, $image_name = null)
{
    $headers = get_headers($image_url);
    unset($headers[0]);
    $temp = [];
    array_map(function ($value) use (&$temp) {
        $value = explode(':', $value);
        $temp[strtolower(trim($value[0]))] = strtolower(trim($value[1]));
    }, $headers);
    $headers = $temp;
    if (!isset($headers['content-type']) || strpos($headers['content-type'], 'image') === false) {
        return false;
    }
    //强制非png即jpg
    if (strpos($headers['content-type'], 'png') === false) {
        $ext = '.jpg';
    } else {
        $ext = '.png';
    }
    if (!is_null($image_name)) {
        $path = '/backend/images/save-outer-image-' . md5($image_name) . $ext;
    } else {
        $path = '/backend/images/' . session_create_id('save-outer-image-') . $ext;
    }
    file_put_contents(app()->getRootPath() . 'public' . $path, file_get_contents($image_url));
    return $path;
}
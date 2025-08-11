<?php

namespace app\common\model;

class User extends BaseModel
{
    protected $type = [
        'is_use' => 'integer',
        'is_admin' => 'integer',
    ];

    /**
     * 获取用户信息
     * @param null $uid
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public static function getUserInfo($uid = null)
    {
        if (empty($uid)) {
            $uid = is_login();
        }
        return self::where('id', $uid)->find() ?: [];
    }

    /**
     * 是否超级管理员
     * @return mixed
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public static function isSuperAdmin($uid = null)
    {
        if (empty($uid)) {
            $uid = is_login();
        }
        return self::getUserInfo($uid)['is_admin'];
    }

    /**
     * 加密密码
     * @param $clear
     * @return string
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public static function translatePassword($clear)
    {
        return md5($clear . config('app.app_name'));
    }
}

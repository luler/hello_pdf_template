<?php

namespace app\home\controller;

use app\common\controller\BaseController;
use app\common\exception\CommonException;
use app\common\helper\PageHelper;
use app\common\model\User;
use think\Request;

class UserController extends BaseController
{
    protected $beforeActionList = [
        'first'
    ];

    protected function first()
    {
        if (!User::isSuperAdmin()) {
            throw new CommonException('无权访问');
        }
    }

    /**
     * 获取用户列表
     * @param Request $request
     * @return \think\response\Json|\think\response\Jsonp
     * @throws CommonException
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function getUserList(Request $request)
    {
        $fields = ['search'];
        $param = $request->only($fields);
        $where = [];
        if (!empty($param['search'])) {
            $where[] = ['a.appid|a.title', 'like', "%{$param['search']}%"];
        }

        $res = (new PageHelper(new User()))
            ->alias('a')
            ->join('user b', 'a.creator_uid=b.id', 'left')
            ->where($where)
            ->order('a.id', 'desc')
            ->autoPage()
            ->field('a.id,a.title,a.appid,a.is_admin,a.email,a.avatar,b.title as creator_name,b.appid as creator_appid,a.is_use,a.create_time,a.last_login_time')
            ->get();

        foreach ($res['list'] as &$value) {
            $value['is_admin'] = (int)$value['is_admin'];
            $value['is_use'] = (int)$value['is_use'];
            $value['last_login_time'] = $value['last_login_time'] ? date('Y-m-d H:i:s', $value['last_login_time']) : '';
        }

        return $this->successResponse('获取成功', $res);
    }

    /**
     * 添加用户
     * @param Request $request
     * @return \think\response\Json|\think\response\Jsonp
     * @throws CommonException
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function addUser(Request $request)
    {
        $fields = ['title', 'appid', 'appsecret', 'is_admin'];
        $param = $request->only($fields);
        checkData($param, [
            'title|名称' => 'require|max:50',
            'appid|appid' => 'require|alphaNum|max:50|unique:user',
            'appsecret|appsecret' => 'require|min:6|max:100',
            'is_admin|用户类型' => 'require|in:0,1',
        ]);

        $param['creator_uid'] = is_login();
        $param['appsecret'] = User::translatePassword($param['appsecret']);
        $param['avatar'] = generateAvatar();
        User::create($param);
        return $this->successResponse('添加成功');
    }

    /**
     * 编辑用户
     * @param Request $request
     * @return \think\response\Json|\think\response\Jsonp
     * @throws CommonException
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function editUser(Request $request)
    {
        $fields = ['title', 'appsecret', 'is_admin', 'is_use', 'id'];
        $param = $request->only($fields);
        checkData($param, [
            'id|用户id' => 'require|integer',
            'title|用户名称' => 'min:1|max:50',
            'appsecret|appsecret' => 'min:6|max:100',
            'is_admin|用户类型' => 'in:0,1',
            'is_use|状态' => 'in:0,1',
        ]);

        if (!empty($param['appsecret'])) {
            $param['appsecret'] = User::translatePassword($param['appsecret']);
        }

        if (User::where('id', $param['id'])->value('appid') === 'admin') {
            unset($param['is_admin']);
            unset($param['is_use']);
            if ($param['id'] !== is_login()) {
                unset($param['appsecret']);
            }
        }

        User::update($param);
        return $this->successResponse('编辑成功');
    }
}

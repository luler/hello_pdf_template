<?php

namespace app\home\controller;

use app\common\controller\BaseController;
use app\common\exception\CommonException;
use app\common\helper\CasHelper;
use app\common\model\User;
use app\common\tools\JwtTools;
use think\Console;
use think\Db;
use think\facade\Cache;

class LoginController extends BaseController
{
    /**
     * 获取token
     * Author:我只想看看蓝天<1207032539@qq.com>
     * @return \think\response\Json|\think\response\Jsonp
     */
    public function getAccessToken()
    {
        try {
            again:
            $fields = ['type', 'appid', 'appsecret', 'mobile', 'captcha'];
            $param = $this->request->only($fields);
            checkData($param, [
                'type|类型' => 'require|in:1,2',
                'appid' => 'requireIf:type,1',
                'appsecret' => 'requireIf:type,1',
                'mobile' => 'requireIf:type,2|mobile',
                'captcha' => 'requireIf:type,2',
            ]);

            if ($param['type'] == 1) {
                $user = User::where('appid', $param['appid'])->find();
                if (empty($user)) {
                    if ($param['appid'] != 'admin') {
                        throw new CommonException('账号不存在');
                    }
                    $accounts = [
                        'title' => config('appid'),
                        'appid' => config('appid'),
                        'appsecret' => User::translatePassword(config('appsecret')),
                        'is_admin' => 1,
                        'is_use' => 1,
                        'avatar' => generateAvatar(),
                    ];
                    $user = User::create($accounts);
                }
                if ($user['appsecret'] !== User::translatePassword($param['appsecret'])) {
                    throw new CommonException('密码输入有误');
                }
            } else {
                $key = 'captcha:' . $param['mobile'];
                if (empty($param['captcha']) || Cache::get($key) !== $param['captcha']) {
                    throw new CommonException('验证码输入有误');
                }
                Cache::rm($key);
                $user = User::where('appid', $param['mobile'])->find();
                if (empty($user)) {
                    $accounts = [
                        'title' => $param['mobile'],
                        'appid' => $param['mobile'],
                        'appsecret' => '',
                        'is_admin' => 0,
                        'is_use' => 1,
                        'avatar' => generateAvatar(),
                    ];
                    $user = User::create($accounts);
                }
            }

            if ($user['is_use'] != 1) {
                throw new CommonException('账号已被禁用');
            }

            //记录最后登录时间
            $user->last_login_time = time();
            $user->save();
            $user['is_admin'] = (int)$user['is_admin'];
            $jwt = new JwtTools();
            $res = $jwt->jsonReturnToken($user['id']);
            unset($user['appsecret']);
            $res['user_info'] = $user;
            return $this->successResponse('获取成功', $res);
        } catch (\Exception $e) {
            if (strpos($e->getMessage(), 'Unknown database') || strpos($e->getMessage(), 'Base table or view not found')) {
                $config = config('database.');
                $config['database'] = '';
                Db::connect($config)->execute('create database if not exists ' . config('database.database') . ' DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_general_ci');
                Console::call('migrate:run');
                goto again;
            }
            return $this->errorResponse($e->getMessage());
        }

    }

    /**
     * CAS登录
     * @return void
     * @throws \Exception
     */
    public function casLogin()
    {
        $field = ['code', 'open_id'];
        $param = $this->request->only($field);
        checkData($param, [
            'code' => 'require',
            'open_id' => 'require',
        ]);

        $user = User::where('cas_open_id', $param['open_id'])->find();
        $key = 'casLogin:' . ($user['id'] ?? 0);
        if (empty($user) || !Cache::has($key)) {
            $res = (new CasHelper())->getUserInfo($param['code']);
            $user = User::where('appid', $res['username'])->find();
            if (empty($user)) {
                User::insert([
                    'title' => $res['title'],
                    'appid' => $res['username'],
                    'appsecret' => User::translatePassword(config('appsecret')),
                    'is_admin' => $res['is_admin'],
                    'cas_open_id' => $param['open_id'],
                    'avatar' => $res['avatar'],
                    'email' => $res['email'],
                    'create_time' => time(),
                    'update_time' => time(),
                ]);
                $user = User::where('appid', $res['username'])->find();
            } else {
                User::where('appid', $res['username'])->update([
                    'title' => $res['title'],
                    'cas_open_id' => $param['open_id'],
                    'avatar' => $res['avatar'],
                    'email' => $res['email'],
                    'update_time' => time(),
                ]);
            }
            Cache::set($key, 1, 60 * 60); //一个小时允许更新一次
        }

        $jwt = new JwtTools();
        $info = $jwt->jsonReturnToken($user['id']);
        unset($user['appsecret']);
        unset($user['cas_open_id']);
        $info['user_info'] = json_encode($user, 256);

        $this->redirect('/frontend/casLogin?' . http_build_query($info));
    }
}

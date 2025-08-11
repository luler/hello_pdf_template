<?php

namespace app\home\controller;

use app\common\controller\BaseController;
use app\common\exception\CommonException;
use app\common\model\PdfTemplate;
use app\common\model\User;
use think\Request;

class CommonController extends BaseController
{
    /**
     * 上传文件接口
     * @param Request $request
     * @return \think\Response
     * @throws CommonException
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function uploadFile(Request $request)
    {
        $file = $request->file('upload');
        if (!$file) {
            return json()->data([
                'uploaded' => 0,
                'error' => [
                    'message' => '请选择上传的文件',
                ],
            ]);
        }

        $ext = config('app.file_upload.ext_limit');
        $info = $file->validate([
            'size' => config('app.file_upload.max_size'),
            'ext' => $ext
        ])->move(env('root_path') . 'public/backend/uploads');
        if (!$info) {
            return json()->data([
                'uploaded' => 0,
                'error' => [
                    'message' => $file->getError(),
                ],
            ]);
        }

        $file_url = \request()->domain() . '/backend/uploads/' . $info->getSaveName();
        return json()->data([
            'uploaded' => 1,
            'url' => $file_url,
        ]);
    }

    /**
     * 重置密码
     * @param Request $request
     * @return \think\response\Json|\think\response\Jsonp
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function editUserInfo(Request $request)
    {
        $field = ['type', 'password', 'password_confirm', 'email'];
        $param = $request->only($field);
        $info = ['update_time' => time(),];
        switch ($param['type'] ?? '') {
            case 'password':
                checkData($param, [
                    'password|密码' => 'require|min:8',
                    'password_confirm|确认密码' => 'require|confirm:password',
                ]);
                $info['appsecret'] = User::translatePassword($param['password']);
                break;
            case 'email':
                checkData($param, [
                    'email|邮箱' => 'email',
                ]);
                $info['email'] = $param['email'];
                break;
        }

        User::where('id', is_login())->update($info);
        return $this->successResponse('设置成功');
    }

    /**
     * 根据内容生成pdf文件
     * @param Request $request
     * @throws \Mpdf\MpdfException
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function downloadPdf(Request $request)
    {
        $field = ['render_direction', 'content'];
        $param = $request->only($field);
        checkData($param, [
            'render_direction' => 'require|in:1,2',
            'content' => 'require',
        ]);

        $file_url = PdfTemplate::createPdf($param['content'], $param['render_direction']);
        return $this->setBackgroundTask(function () {
            //清除过期
            PdfTemplate::reomveTempPdf();
        })->successResponse('获取成功', [
            'file_url' => $file_url,
        ]);
    }

}

<?php

namespace app\home\controller;

use app\common\controller\BaseController;
use app\common\exception\CommonException;
use app\common\helper\PageHelper;
use app\common\model\User;
use app\common\model\PdfTemplate;
use think\Request;

class PdfTemplateController extends BaseController
{
    /**
     * 保存pdf模板
     * @param Request $request
     * @return \think\response\Json|\think\response\Jsonp
     * @throws CommonException
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function savePdfTemplate(Request $request)
    {
        $field = ['id', 'title', 'desc', 'render_direction', 'edit_type', 'content',];
        $param = $request->only($field);
        checkData($param, [
            'id' => 'integer',
            'title|模板标题' => 'require',
            'desc|模板描述' => 'require',
            'render_direction|渲染方向' => 'require|in:1,2',
            'edit_type|编辑方式' => 'require|in:1,2',
            'content|模板内容' => 'require',
        ]);

        //鉴权
        if (!User::isSuperAdmin()) {
            if (!empty($param['id']) && is_login() != PdfTemplate::where('id', $param['id'])->value('uid')) {
                throw new CommonException('无权限');
            }
            $param['status'] = 0; //需要审核
            $param['approval_uid'] = 0;
            $param['approval_time'] = 0;
            $param['approval_reason'] = '';
        } else {
            $param['status'] = 1; //自动审核
            $param['approval_uid'] = is_login();
            $param['approval_time'] = time();
        }

        if (PdfTemplate::where('uid', is_login())
            ->where('title', $param['title'])
            ->where('id', '<>', $param['id'] ?? '')
            ->count()) {
            throw new CommonException('pdf模板名称已存在');
        }

        if (empty($param['id'])) {
            //新建添加创建人
            $param['uid'] = is_login();
            $param['is_use'] = 1;
            $param['code'] = uniqid();
            PdfTemplate::create($param);
        } else {
            PdfTemplate::update($param);
        }
        return $this->successResponse('保存成功', $param);
    }

    /**
     * 编辑启用禁用状态
     * @param Request $request
     * @return \think\response\Json|\think\response\Jsonp
     * @throws CommonException
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function editPdfTemplate(Request $request)
    {
        $field = ['id', 'is_use',];
        $param = $request->only($field);
        checkData($param, [
            'id' => 'require|integer',
            'is_use|是否启用' => 'require|in:0,1',
        ]);

        if (!User::isSuperAdmin()) {
            if (!PdfTemplate::where('id', $param['id'])
                ->where('uid', is_login())
                ->count()) {
                throw new CommonException('无权限');
            }
        }

        PdfTemplate::update($param);
        return $this->successResponse('保存成功');
    }

    /**
     * 审核模板
     * @param Request $request
     * @return \think\response\Json|\think\response\Jsonp
     * @throws CommonException
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function approvalPdfTemplate(Request $request)
    {
        $field = ['ids', 'status', 'approval_reason',];
        $param = $request->only($field);
        checkData($param, [
            'ids' => 'require|array',
            'status|状态' => 'require|in:0,1,2',
            'approval_reason|审核理由' => 'max:255',
        ]);

        if (!User::isSuperAdmin()) {
            throw new CommonException('无权限');
        }

        PdfTemplate::where('id', 'in', $param['ids'])->update([
            'status' => $param['status'],
            'approval_reason' => $param['approval_reason'],
            'approval_uid' => is_login(),
            'approval_time' => time(),
            'update_time' => time(),
        ]);
        return $this->successResponse('审核成功');
    }

    /**
     * 获取pdf模板列表
     * @param Request $request
     * @return \think\response\Json|\think\response\Jsonp
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function getPdfTemplateList(Request $request)
    {
        $field = ['search', 'is_approval_list',];
        $param = $request->only($field);
        $param['is_approval_list'] = $param['is_approval_list'] ?? 0;

        $where = [];
        if (!empty($param['search'])) {
            $where[] = ['a.title|a.desc|b.title', 'like', "%{$param['search']}%"];
        }
        if (isset($param['is_approval_list'])) {
            if ($param['is_approval_list'] == 1) {
                $where[] = ['a.status', '<>', 1]; //找不是通过的
            } else {
                $where[] = ['a.status', '=', 1]; //找是通过的
            }
        }

        if (!User::isSuperAdmin()) {
            $where[] = ['a.uid', '=', is_login()];
        }

        $res = (new PageHelper(new PdfTemplate()))
            ->alias('a')
            ->join('user b', 'a.uid=b.id', 'left')
            ->where($where)
            ->field('a.id,a.code,a.title,a.desc,a.is_use,a.status,a.approval_reason,a.approval_time,a.use_count,a.render_direction,b.title as username')
            ->autoPage()
            ->order(['a.status' => 'asc', 'a.update_time' => 'desc'])
            ->get();

        foreach ($res['list'] as &$value) {
            $value['approval_time'] = $value['approval_time'] ? date('Y-m-d H:i:s', $value['approval_time']) : '';
        }
        return $this->successResponse('获取成功', $res);
    }

    /**
     * 获取模板信息
     * @param Request $request
     * @return \think\response\Json|\think\response\Jsonp
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function getPdfTemplateInfo(Request $request)
    {
        $field = ['id'];
        $param = $request->only($field);

        $where = [];

        if (!User::isSuperAdmin()) {
            $where[] = ['uid', '=', is_login()];
        }

        $res = PdfTemplate::find($param['id']);
        return $this->successResponse('获取成功', $res);
    }

    /**
     * 删除pdf模板
     * @param Request $request
     * @return \think\response\Json|\think\response\Jsonp
     * @throws \Exception
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function delPdfTemplate(Request $request)
    {
        $field = ['ids'];
        $param = $request->only($field);

        checkData($param, [
            'ids' => 'require|array',
        ]);
        $where = [];
        $where[] = ['id', 'in', $param['ids']];
        if (!User::isSuperAdmin()) {
            $where[] = ['uid', '=', is_login()];
        }

        PdfTemplate::where($where)->delete();
        return $this->successResponse('删除成功');
    }
}

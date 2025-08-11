<?php

namespace app\home\controller;

use app\common\controller\BaseController;
use app\common\exception\CommonException;
use app\common\model\PdfTemplate;
use app\common\model\User;
use think\Request;

class OpenController extends BaseController
{
    /**
     * 创建PDF
     * @param Request $request
     * @throws CommonException
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public function createPdf(Request $request)
    {
        $field = ['code', 'param'];
        $param = $request->only($field);
        checkData($param, [
            'code|模板编码' => 'require',
            'param|模板参数' => 'array',
        ]);

        $param['param'] = $param['param'] ?? [];

        $where = [];
        if (!User::isSuperAdmin()) {
            $where[] = ['uid', '=', is_login()];
        }
        $where[] = ['code', '=', $param['code']];
        $pdfTemplate = PdfTemplate::where($where)->find();
        if (empty($pdfTemplate)) {
            throw new CommonException('模板不存在');
        }
        if ($pdfTemplate['status'] != 1) {
            throw new CommonException('模板未审核通过');
        }
        if ($pdfTemplate['is_use'] == 0) {
            throw new CommonException('模板已被禁用');
        }

        $content = $pdfTemplate['content'];
        $render_direction = $pdfTemplate['render_direction'];
        try {
            $content = $this->display($content, $param['param'])->getContent();
        } catch (\Exception $e) {
            throw new CommonException('模板内容解析错误: ' . $e->getMessage());
        }
        $file_url = PdfTemplate::createPdf($content, $render_direction);

        //使用次数增加
        $pdfTemplate->setInc('use_count');
        return $this->setBackgroundTask(function () {
            //清除过期
            PdfTemplate::reomveTempPdf();
        })->successResponse('获取成功', [
            'file_url' => $file_url,
        ]);
    }
}

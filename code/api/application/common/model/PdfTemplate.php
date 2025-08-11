<?php

namespace app\common\model;


use Mpdf\Output\Destination;
use think\facade\Cache;

class PdfTemplate extends BaseModel
{
    protected $type = [
        'is_use' => 'integer',
        'render_direction' => 'integer',
        'status' => 'integer',
        'edit_type' => 'integer',
    ];

    /**
     * 生成pdf
     * @param $content
     * @param int $render_direction //渲染方向，1-纵向，2-横向
     * @return string
     * @throws \Mpdf\MpdfException
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    public static function createPdf($content, $render_direction = 1)
    {
        $mpdf = new \Mpdf\Mpdf([
            'mode' => 'zh-cn', //设置指定语言，会自动侦探对应字体
            'orientation' => $render_direction == 1 ? 'p' : 'l', //写pdf的方向，l-横向布局，p-纵向布局
        ]);

        $mpdf->WriteHTML($content);
        $url = '/backend/pdf/' . uniqid() . '.pdf';
        $file_path = app()->getRootPath() . 'public' . $url;
        $mpdf->Output($file_path, Destination::FILE);
        $file_url = \request()->domain() . $url;
        return $file_url;
    }

    /**
     * 删除过期文件
     * @author 我只想看看蓝天 <1207032539@qq.com>
     */
    private static function reomveTempPdf()
    {
        $remove_temp_pdf_file_day = config('app.remove_temp_pdf_file_day');
        $key = 'PdfTemplate:reomveTempPdf';
        if (empty($remove_temp_pdf_file_day) || Cache::has($key)) {
            return;
        }
        //删除N天前的文件
        $remove_temp_pdf_file_day_time = $remove_temp_pdf_file_day * 24 * 60 * 60;
        $time = time();
        Cache::set($key, $time, $remove_temp_pdf_file_day_time);

        $pattern = app()->getRootPath() . 'public/backend/pdf/*.pdf';
        $files = glob($pattern);

        foreach ($files as $file) {
            if (filectime($file) + $remove_temp_pdf_file_day_time < $time) {
                @unlink($file);
            }
        }
    }
}

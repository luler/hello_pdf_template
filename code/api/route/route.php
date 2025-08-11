<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006~2018 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: liu21st <liu21st@gmail.com>
// +----------------------------------------------------------------------

use think\facade\Route;

Route::group('api', function () {
    Route::group('', function () {

        Route::post('getAccessToken', 'home/Login/getAccessToken')->middleware('Throttle:3,5');
        Route::get('casLogin', 'home/Login/casLogin');

        //需要登录的路由
        Route::group('', function () {
            // +----------------------------------------------------------------------
            // | 前后台公共
            // +----------------------------------------------------------------------
            Route::post('uploadFile', 'home/Common/uploadFile');
            Route::post('editUserInfo', 'home/Common/editUserInfo');
            Route::post('downloadPdf', 'home/Common/downloadPdf');
            Route::post('createPdf', 'home/Open/createPdf');

            //用户管理
            Route::get('getUserList', 'home/User/getUserList');
            Route::post('addUser', 'home/User/addUser');
            Route::post('editUser', 'home/User/editUser');

            //模板管理
            Route::get('getPdfTemplateList', 'home/PdfTemplate/getPdfTemplateList');
            Route::get('getPdfTemplateInfo', 'home/PdfTemplate/getPdfTemplateInfo');
            Route::post('savePdfTemplate', 'home/PdfTemplate/savePdfTemplate');
            Route::post('editPdfTemplate', 'home/PdfTemplate/editPdfTemplate');
            Route::post('delPdfTemplate', 'home/PdfTemplate/delPdfTemplate');
            Route::post('approvalPdfTemplate', 'home/PdfTemplate/approvalPdfTemplate');


        })->middleware('Auth');

    })->middleware('Throttle:60,1');

});

// miss 路由
Route::miss(function () {
    throw new \think\exception\RouteNotFoundException();
});

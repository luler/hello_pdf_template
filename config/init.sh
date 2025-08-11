#!/bin/bash

#执行数据库迁移
cd /home/wwwroot/api && php think migrate:run
#更改php代码存放目录的权限，防止出现文件权限问题
/usr/bin/chown -R www.www /home/wwwroot

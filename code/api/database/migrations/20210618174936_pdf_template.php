<?php

use think\migration\Migrator;
use think\migration\db\Column;

class PdfTemplate extends Migrator
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-abstractmigration-class
     *
     * The following commands can be used in this method and Phinx will
     * automatically reverse them when rolling back:
     *
     *    createTable
     *    renameTable
     *    addColumn
     *    renameColumn
     *    addIndex
     *    addForeignKey
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change()
    {
        $table = $this->table('pdf_template', array('engine' => 'InnoDB', 'comment' => 'pdf模板表', 'collation' => 'utf8mb4_general_ci'));
        $table->addColumn('code', 'string', ['limit' => 50, 'default' => '', 'comment' => '模板编码', 'null' => false])
            ->addColumn('uid', 'integer', ['default' => 0, 'comment' => '本系统用户id', 'null' => false])
            ->addColumn('title', 'string', ['limit' => 255, 'default' => '', 'comment' => '模板名称', 'null' => false])
            ->addColumn('desc', 'string', ['limit' => 255, 'default' => '', 'comment' => '简要描述', 'null' => false])
            ->addColumn('use_count', 'integer', ['default' => 0, 'comment' => '使用次数', 'null' => false])
            ->addColumn('is_use', 'integer', ['limit' => \Phinx\Db\Adapter\MysqlAdapter::INT_TINY, 'default' => 0, 'comment' => '是否启用，0-禁用，1-启用', 'null' => false])
            ->addColumn('render_direction', 'integer', ['limit' => \Phinx\Db\Adapter\MysqlAdapter::INT_TINY, 'default' => 1, 'comment' => '渲染方向，1-纵向，2-横向', 'null' => false])
            ->addColumn('param_config', 'string', ['limit' => 1024, 'default' => '', 'comment' => '参数配置', 'null' => false])
            ->addColumn('content', 'text', ['comment' => '模板内容', 'null' => true])
            ->addColumn('edit_type', 'integer', ['limit' => \Phinx\Db\Adapter\MysqlAdapter::INT_TINY, 'default' => 1, 'comment' => '编辑方式，1-富文本，2-纯代码', 'null' => false])
            ->addColumn('status', 'integer', ['limit' => \Phinx\Db\Adapter\MysqlAdapter::INT_TINY, 'default' => 0, 'comment' => '状态，0-待审核，1-审核通过，2-审核不通过', 'null' => false])
            ->addColumn('approval_uid', 'integer', ['default' => 0, 'comment' => '审核人', 'null' => false])
            ->addColumn('approval_time', 'integer', ['default' => 0, 'comment' => '审核时间', 'null' => false])
            ->addColumn('approval_reason', 'string', ['limit' => 255, 'default' => '', 'comment' => '审核理由', 'null' => false])
            ->addColumn('create_time', 'integer', ['default' => 0, 'comment' => '创建时间', 'null' => false])
            ->addColumn('update_time', 'integer', ['default' => 0, 'comment' => '更新时间', 'null' => false])
            ->addIndex(['code'])
            ->create();
    }
}

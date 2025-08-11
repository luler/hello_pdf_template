<?php

use think\migration\Migrator;
use think\migration\db\Column;

class Config extends Migrator
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
        $table = $this->table('config', array('engine' => 'InnoDB', 'comment' => '配置表', 'collation' => 'utf8mb4_general_ci'));
        $table->addColumn('uid', 'integer', ['default' => 0, 'comment' => '所属用户', 'null' => false])
            ->addColumn('key', 'string', ['default' => '', 'comment' => '配置名', 'null' => false])
            ->addColumn('value', 'string', ['limit' => 4096, 'default' => '', 'comment' => '配置值', 'null' => false])
            ->addColumn('create_time', 'integer', ['default' => 0, 'comment' => '创建时间', 'null' => false])
            ->addColumn('update_time', 'integer', ['default' => 0, 'comment' => '更新时间', 'null' => false])
            ->create();
    }
}

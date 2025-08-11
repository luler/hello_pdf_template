import {
  Breadcrumb,
  Button,
  Divider,
  Icon,
  Input,
  message, Modal,
  Popconfirm,
  Switch,
  Table, Tag
} from 'antd';
import BasePage from '@/pages/BasePage';
import {request_get, request_post} from '@/utils/request_tool';
import {getBaseSiteInfo} from "@/utils/commonInfo";
import React from "react";
import {getUserInfo} from "@/utils/authority";

export default class Template extends BasePage {
  state = {
    _loading: false,
    _btn_loading: 0,
    list: [],
    data: {
      nickname: '',
    },
    param: {
      page: 1,
      page_rows: 10,
      search: '',
      is_approval_list: 0,
    },
    pagination: {
      showTotal: total => `总共${total}条数据`,
      onChange: page => {
        this.setState(
          {
            param: {
              ...this.state.param,
              page,
            },
          },
          () => {
            this.fetch();
          }
        );
      },
    },
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '模板编码',
      dataIndex: 'code',
    },
    {
      title: '模板名称',
      dataIndex: 'title',
    },
    {
      title: '简要描述',
      dataIndex: 'desc',
    },
    {
      title: '是否启用',
      render: (text, record) => (
        <div>
          <Switch
            checkedChildren="启用"
            unCheckedChildren="禁用"
            onChange={checked => {
              request_post('/api/editPdfTemplate', {
                id: record.id,
                is_use: checked ? 1 : 0,
              }).then(res => {
                if (res.code === 200) {
                  message.success(res.message)
                  this.fetch()
                }
              })
            }}
            defaultChecked={record.is_use === 1 ? true : false}
          />
        </div>
      ),
    },
    {
      title: '渲染方向',
      render: (text, record) => (
        <div>
          {['', <Tag color="#2db7f5">纵向</Tag>, <Tag>横向</Tag>,][record.render_direction]}
        </div>
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'use_count',
    },
    {
      title: '所属用户',
      dataIndex: 'username',
    },
    {
      title: '操作',
      width: 220,
      render: (value, item) => {
        return (
          <div>
            <a
              onClick={() => {

                if (getUserInfo().is_admin === 1) {
                  window.location.href = `/template/save/${item.id}`
                } else { // 非管理员提示需要审核
                  Modal.confirm({
                    title: '注意',
                    content: '编辑后需要重新审核通过才能继续使用，您还要继续编辑吗？',
                    okText: '确定',
                    cancelText: '取消',
                    onOk: () => {
                      window.location.href = `/template/save/${item.id}`
                    }
                  })
                }

              }}
            >
              编辑
            </a>
            <Divider type="vertical"/>
            <Popconfirm
              title="您确定要删除吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => {
                request_post('/api/delPdfTemplate', {ids: [item.id]}).then(() => {
                  this.fetch();
                });
              }}
            >
              <a style={{color: 'red'}} href="#">删除</a>
            </Popconfirm>
          </div>
        )
          ;
      },
    },
  ];

  componentDidMount() {
    this.fetch();
  }

// 获取数据
  fetch(isLoading = true) {
    this.setState(
      {
        _loading: !!isLoading,
        lock: true,
      },
      () => {
        request_get('/api/getPdfTemplateList', this.state.param).then(res => {
          this.setState({
            ...this.state,
            list: res.info.list,
            _loading: false,
            lock: false,
            pagination: {
              ...this.state.pagination,
              total: res.info.total,
              current: res.info.page,
              pageSize: res.info.page_rows,
            },
          });
        });
      }
    );
  }

  render() {
    return (
      <div>
        <Breadcrumb
          style={{
            padding: 20,
          }}
        >
          <Breadcrumb.Item>
            <a href='/'>{getBaseSiteInfo().site_title}</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            模板管理
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            模板列表
          </Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            background: 'white',
            padding: 20,
          }}
        >
          <div>
            <Button
              style={{
                marginTop: 20,
              }}
              type="primary"
              onClick={() => {
                window.location.href = '/template/save/0'
              }}
            >
              <Icon type='plus'/>
              新增
            </Button>

            <Button
              style={{
                marginTop: 20,
                marginLeft: 10,
              }}
              onClick={() => {
                window.location.href = '/backend/接口文档.docx'
              }}
            >
              接口文档
            </Button>

            <Input.Search
              allowClear
              onSearch={key => {
                this.setState(
                  {
                    param: {
                      ...this.state.param,
                      page: 1,
                      search: key,
                    },
                  },
                  () => {
                    this.fetch();
                  }
                );
              }}
              placeholder="请输入关键字"
              style={{maxWidth: 300, float: 'right', marginTop: 20}}
            />
          </div>

          <div
            style={{
              margin: '30px 0',
            }}
          >
            <Table
              columns={this.columns}
              loading={this.state._loading}
              dataSource={this.state.list}
              rowKey="id"
              pagination={this.state.pagination}
            />
          </div>
        </div>
      </div>
    );
  }
}

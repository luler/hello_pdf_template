import {
  Breadcrumb, Button,
  Divider,
  Input, message, Modal,
  Popconfirm,
  Table, Tag
} from 'antd';
import BasePage from '@/pages/BasePage';
import {getUserInfo} from '@/utils/authority';
import {request_get, request_post} from '@/utils/request_tool';
import {getBaseSiteInfo} from "@/utils/commonInfo";
import React from "react";

export default class TemplateApproval extends BasePage {
  state = {
    selectedRowKeys: [],
    approval_reason: '',
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
      is_approval_list: 1,
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
    // {
    //   title: '模板编码',
    //   dataIndex: 'code',
    // },
    {
      title: '模板名称',
      dataIndex: 'title',
    },
    {
      title: '简要描述',
      dataIndex: 'desc',
    },
    {
      title: '所属用户',
      dataIndex: 'username',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: value => (
        [<Tag>待审核</Tag>, <Tag color="#87d068">审核通过</Tag>, <Tag color="#f50">审核不通过</Tag>,][value]
      )
    },
    {
      title: '审核理由',
      dataIndex: 'approval_reason',
    },
    {
      title: '审核时间',
      dataIndex: 'approval_time',
    },
    {
      title: '操作',
      width: 180,
      render: (value, item) => {
        return (
          <div>
            <a
              onClick={() => {
                window.location.href = `/template/save/${item.id}`
              }}
            >
              重新申请
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
        );
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
            selectedRowKeys: [],
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
            模板审核
          </Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            background: 'white',
            padding: 20,
          }}
        >
          <div>
            {getUserInfo().is_admin === 1 &&
            <Button
              style={{
                marginTop: 20
              }}
              type='primary'
              onClick={() => {
                if (this.state.selectedRowKeys.length <= 0) {
                  message.info('请选择需要审核的模板');
                  return;
                }
                request_post('/api/approvalPdfTemplate', {
                  ids: this.state.selectedRowKeys,
                  status: 1,
                  approval_reason: '',
                }).then(res => {
                  if (res.code === 200) {
                    message.success(res.message)
                    this.fetch()
                  }
                })
              }}
            >
              通过
            </Button>}
            {getUserInfo().is_admin === 1 &&
            <Button
              style={{
                marginLeft: 10,
                marginTop: 20
              }}
              type='danger'
              onClick={() => {
                if (this.state.selectedRowKeys.length <= 0) {
                  message.info('请选择需要审核的模板');
                  return;
                }
                Modal.confirm({
                  title: '审核理由',
                  content: <Input.TextArea
                    defaultValue={this.state.approval_reason}
                    rows={3}
                    placeholder='请输入'
                    onChange={e => {
                      this.setState({approval_reason: e.target.value})
                    }}
                  />,
                  okText: '确定',
                  cancelText: '取消',
                  onOk: () => {
                    request_post('/api/approvalPdfTemplate', {
                      ids: this.state.selectedRowKeys,
                      status: 2,
                      approval_reason: this.state.approval_reason,
                    }).then(res => {
                      if (res.code === 200) {
                        message.success(res.message)
                        this.fetch()
                      }
                    })
                  }
                })
              }}
            >
              不通过
            </Button>}

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
              rowSelection={{
                selectedRowKeys: this.state.selectedRowKeys,
                onChange: (selectedRowKeys) => {
                  this.setState({selectedRowKeys})
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

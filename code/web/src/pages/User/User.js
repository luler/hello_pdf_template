import React, { Component } from 'react';
import { Avatar, Breadcrumb, Button, Form, Input, Modal, Select, Switch, Table } from 'antd';
import { request_get, request_post } from '@/utils/request_tool';
import moment from 'moment';
import { getBaseSiteInfo } from '@/utils/commonInfo';

export default class User extends Component {
  state = {
    params: {
      page: 1,
      page_rows: 10,
      search: '',
    },
    visible: false,
    create_data: {},
    edit_visible: false,
    edit_data: {},
    _loading: false,
    info: {
      page: 1,
      page_rows: 10,
      total: 0,
      list: [],
    },
  };

  componentDidMount() {
    this.fetch(this.state.params);
  }

  handleTableChange = pagination => {
    this.setState(
      {
        params: {
          ...this.state.params,
          page: pagination.current,
          page_rows: pagination.pageSize,
        },
      },
      () => {
        this.fetch(this.state.params);
      }
    );
  };

  onSearch = () => {
    this.setState(
      {
        params: {
          ...this.state.params,
          page: 1,
        },
      },
      () => {
        this.fetch(this.state.params);
      }
    );
  };

  fetch(params) {
    this.setState(
      {
        _loading: true,
      },
      () => {
        request_get('/api/getUserList', params).then(res => {
          this.setState({
            info: res.info,
            _loading: false,
          });
        });
      }
    );
  }

  showCreateModel = () => {
    this.setState({
      visible: true,
      create_data: {
        title: '',
        appid: '',
        appsecret: '',
        is_admin: '',
      },
    });
  };

  showEditModel = (id, title, appid, is_admin) => {
    this.setState(
      {
        edit_visible: true,
        edit_data: {
          id: id,
          title: title,
          appid: appid,
          is_admin: is_admin,
        },
      },
      () => {
        //
      }
    );
  };

  onFormFieldChange = e => {
    if (e == 1 || e == 0) {
      this.setState({
        create_data: {
          ...this.state.create_data,
          is_admin: e,
        },
      });
    } else {
      switch (e.target.name) {
        case 'title':
          this.setState({
            create_data: {
              ...this.state.create_data,
              title: e.target.value,
            },
          });
          break;
        case 'appid':
          this.setState({
            create_data: {
              ...this.state.create_data,
              appid: e.target.value,
            },
          });
          break;
        case 'appsecret':
          this.setState({
            create_data: {
              ...this.state.create_data,
              appsecret: e.target.value,
            },
          });
          break;
      }
    }
  };

  onEditFormFieldChange = e => {
    if (e == 1 || e == 0) {
      this.setState({
        edit_data: {
          ...this.state.edit_data,
          is_admin: e,
        },
      });
    } else {
      switch (e.target.name) {
        case 'title':
          this.setState({
            edit_data: {
              ...this.state.edit_data,
              title: e.target.value,
            },
          });
          break;
        case 'appid':
          this.setState({
            edit_data: {
              ...this.state.edit_data,
              appid: e.target.value,
            },
          });
          break;
        case 'appsecret':
          this.setState({
            edit_data: {
              ...this.state.edit_data,
              appsecret: e.target.value,
            },
          });
          break;
      }
    }
  };

  handleOk = () => {
    this.setState(
      {
        confirmLoading: true,
      },
      () => {
        request_post('/api/addUser', this.state.create_data).then(() => {
          this.setState(
            {
              visible: false,
              confirmLoading: false,
              params: {
                ...this.state.params,
                page: 1,
              },
            },
            () => {
              this.fetch(this.state.params);
            }
          );
        });
      }
    );
  };

  handleEditOk = () => {
    this.setState(
      {
        confirmLoading: true,
      },
      () => {
        request_post('/api/editUser', this.state.edit_data).then(() => {
          this.setState(
            {
              edit_visible: false,
              confirmLoading: false,
              params: {
                ...this.state.params,
                page: 1,
              },
            },
            () => {
              this.fetch(this.state.params);
            }
          );
        });
      }
    );
  };

  onSwithChange = (is_use, id) => {
    request_post('/api/editUser', {
      id: id,
      is_use: is_use,
    }).then(() => {
      this.setState(
        {
          params: {
            ...this.state.params,
            page: 1,
          },
        },
        () => {
          this.fetch(this.state.params);
        }
      );
    });
  };

  render() {
    const columns = [
      {
        title: 'Id',
        dataIndex: 'id',
      },
      {
        title: '用户',
        render: (value, item) => {
          return (
            <div>
              <Avatar src={item.avatar} />
              &nbsp; &nbsp;
              <span>{item.title}</span>
            </div>
          );
        },
      },
      {
        title: '账号',
        dataIndex: 'appid',
      },
      // {
      //   title: '邮箱',
      //   dataIndex: 'email',
      // },
      {
        title: '用户类型',
        dataIndex: 'is_admin',
        render: (text, record) => <div>{record.is_admin === 1 ? '超级管理员' : '普通用户'}</div>,
      },
      {
        title: '状态',
        dataIndex: 'is_use',
        render: (text, record) => (
          <div>
            <Switch
              checkedChildren="启用"
              unCheckedChildren="禁用"
              onChange={checked => {
                this.onSwithChange(checked ? 1 : 0, record.id);
              }}
              defaultChecked={record.is_use === 1 ? true : false}
            />
          </div>
        ),
      },
      {
        title: '创建人',
        render: (text, record) => (
          <div>
            {record.creator_appid}/{record.creator_name}
          </div>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
      },
      {
        title: '最后登录时间',
        dataIndex: 'last_login_time',
        render: text => {
          return text && `${text}(${moment(text).fromNow()})`;
        },
      },
      {
        title: '操作',
        render: (text, record) => (
          <span>
            <a
              onClick={() => {
                this.showEditModel(record.id, record.title, record.appid, record.is_admin);
              }}
            >
              编辑
            </a>
          </span>
        ),
      },
    ];

    const pagination = {
      current: this.state.info.page,
      total: this.state.info.total,
      pageSize: this.state.params.page_rows,
      showTotal: (total, range) => `总共 ${total} 条数据`,
    };

    return (
      <div>
        <Breadcrumb
          style={{
            padding: 20,
          }}
        >
          <Breadcrumb.Item>
            <a href="/">{getBaseSiteInfo().site_title}</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>用户管理</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: 'white', padding: 20 }}>
          <Modal
            title="编辑用户"
            visible={this.state.edit_visible}
            onOk={this.handleEditOk}
            confirmLoading={this.state.confirmLoading || false}
            okText="保存"
            onCancel={() => {
              this.setState({
                edit_visible: false,
                confirmLoading: false,
              });
            }}
          >
            <Form>
              <Form.Item required label="用户名称">
                <Input
                  onInput={this.onEditFormFieldChange}
                  name="title"
                  value={this.state.edit_data.title}
                  placeholder="请输入用户名称"
                />
              </Form.Item>

              <Form.Item required label="账号">
                <Input
                  onInput={this.onEditFormFieldChange}
                  name="appid"
                  value={this.state.edit_data.appid}
                  placeholder="请输入账号"
                  disabled={true}
                />
              </Form.Item>

              <Form.Item label="密码">
                <Input
                  onInput={this.onEditFormFieldChange}
                  name="appsecret"
                  value={this.state.edit_data.appsecret}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <Form.Item required label="用户类型">
                <Select
                  value={this.state.edit_data.is_admin + ''}
                  onChange={this.onEditFormFieldChange}
                >
                  <Select.Option value="0">普通用户</Select.Option>
                  <Select.Option value="1">超级管理员</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>

          <div style={{ padding: '20px 0' }}>
            <Button icon="plus" type="primary" onClick={this.showCreateModel}>
              新增
            </Button>
            <Modal
              title="新增用户"
              visible={this.state.visible}
              onOk={this.handleOk}
              confirmLoading={this.state.confirmLoading || false}
              okText="保存"
              onCancel={() => {
                this.setState({
                  visible: false,
                  confirmLoading: false,
                });
              }}
            >
              <Form>
                <Form.Item required label="title">
                  <Input
                    onInput={this.onFormFieldChange}
                    name="title"
                    placeholder="请输入用户名称"
                    value={this.state.create_data.title}
                  />
                </Form.Item>

                <Form.Item required label="appid">
                  <Input
                    onInput={this.onFormFieldChange}
                    name="appid"
                    placeholder="请输入appid"
                    value={this.state.create_data.appid}
                  />
                </Form.Item>

                <Form.Item required label="appsecret">
                  <Input
                    onInput={this.onFormFieldChange}
                    name="appsecret"
                    placeholder="请输入appsecret"
                    value={this.state.create_data.appsecret}
                  />
                </Form.Item>

                <Form.Item required label="用户类型">
                  <Select onChange={this.onFormFieldChange}>
                    <Select.Option value="0">普通用户</Select.Option>
                    <Select.Option value="1">超级管理员</Select.Option>
                  </Select>
                </Form.Item>
              </Form>
            </Modal>

            <Input.Search
              allowClear
              onSearch={key => {
                this.setState(
                  {
                    params: {
                      ...this.state.params,
                      page: 1,
                      search: key,
                    },
                  },
                  () => {
                    this.fetch(this.state.params);
                  }
                );
              }}
              placeholder="请输入关键字"
              style={{ maxWidth: 300, float: 'right' }}
            />
          </div>
          <Table
            // style={{tableLayout: 'fixed'}}
            dataSource={this.state.info.list}
            rowKey="id"
            pagination={pagination}
            columns={columns}
            loading={this.state._loading}
            // bordered
            onChange={this.handleTableChange}
          />
        </div>
      </div>
    );
  }
}

import {Breadcrumb, Button, Form, Input, message, Radio, Spin} from 'antd';
import BasePage from '@/pages/BasePage';
import {request_get, request_post} from '@/utils/request_tool';
import {getBaseSiteInfo} from '@/utils/commonInfo';
import React from 'react';
import {CKEditor} from 'ckeditor4-react';
import {getAccessToken} from '@/utils/authority';
import {Controlled as CodeMirror} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import './TemplateSave.css';

export default class Template extends BasePage {
  state = {
    spinning: false,
    editor: null,
    data: {
      // 默认数据
      render_direction: 1,
      edit_type: 1,
      content: '',
    },
  };

  componentDidMount() {
    // 加载完再初始化
    if (this.props.match.params.id > 0) {
      this.setState({spinning: true,},
        () => {
          request_get('/api/getPdfTemplateInfo', {
            id: this.props.match.params.id,
          }).then(res => {
            this.setState(
              {
                data: res.info,
                spinning: false,
              },
              () => {
                this.state.editor && this.state.editor.setData(this.state.data.content);
              }
            );
          });
        })
    }
  }

  setData(field, value) {
    const {data} = this.state;
    data[field] = value;
    this.setState({data});
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
            <a href="/">{getBaseSiteInfo().site_title}</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a href="/template/list">模板管理</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>模板内容</Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            background: 'white',
            padding: 20,
          }}
        >
          <Spin spinning={this.state.spinning}>
            <Form>
              <Form.Item required label="模板标题">
                <Input
                  placeholder="请输入"
                  value={this.state.data.title || ''}
                  onChange={e => {
                    this.setData('title', e.target.value);
                  }}
                />
              </Form.Item>

              <Form.Item required label="模板描述">
                <Input
                  placeholder="请输入"
                  value={this.state.data.desc || ''}
                  onChange={e => {
                    this.setData('desc', e.target.value);
                  }}
                />
              </Form.Item>

              <Form.Item required label="渲染方向">
                <Radio.Group
                  value={this.state.data.render_direction || ''}
                  onChange={e => {
                    this.setData('render_direction', e.target.value);
                  }}
                >
                  <Radio value={1}>纵向</Radio>
                  <Radio value={2}>横向</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item required label={<span>编辑方式（纯代码方式支持thinkphp5.1模板引擎所有语法，存在特殊语法情况不能切换，参考：1. <a target='_blank' href='https://www.kancloud.cn/manual/thinkphp5_1/354071'>在线文档</a> 2. <a target='_blank' href='/backend/ThinkPHP5.1.pdf'>本地PDF</a>）</span>}>
                <Radio.Group
                  value={this.state.data.edit_type}
                  onChange={e => {
                    this.setData('edit_type', e.target.value);
                  }}
                >
                  <Radio value={1}>富文本</Radio>
                  <Radio value={2}>纯代码</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item required label="模板内容">
                {this.state.data.edit_type === 1 ?
                  <CKEditor
                    editorUrl='/ckeditor4.17.2/ckeditor.js'
                    onLoaded={e => {
                      const {editor} = e;
                      // 延迟可以防止editor未准备好，最后的内容无法监听到改变
                      setTimeout(() => {
                        this.setState({editor})
                        editor.setData(this.state.data.content)
                      }, 1000);
                    }}
                    onChange={e => {
                      const {editor} = e;
                      // 延迟可以防止editor未准备好，最后的内容无法监听到改变
                      setTimeout(() => {
                        this.setData('content', editor.getData());
                      }, 1000);
                    }}
                    config={{
                      toolbarGroups: [
                        {name: 'document', groups: ['mode', 'document', 'doctools']},
                        {name: 'clipboard', groups: ['undo', 'clipboard']},
                        {name: 'styles', groups: ['styles']},
                        {name: 'colors', groups: ['colors']},
                        {name: 'editing', groups: ['find', 'selection', 'editing']},
                        {name: 'forms', groups: ['forms']},
                        {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
                        {
                          name: 'paragraph',
                          groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'],
                        },
                        {name: 'links', groups: ['links']},
                        {name: 'insert', groups: ['insert']},
                        {name: 'tools', groups: ['tools']},
                        // {name: 'others', groups: ['others']},
                        // {name: 'about', groups: ['about']}
                      ],
                      extraPlugins:
                        'editorplaceholder,codesnippet,print,format,font,colorbutton,justify,uploadimage,indent,pagebreak,autogrow',
                      codeSnippet_theme: 'monokai_sublime',
                      editorplaceholder: '请输入内容，{$param}代表参数',
                      removeButtons: '',
                      format_tags: 'p;h1;h2;h3;h4;h5;h6;pre;address;div',
                      height: 600,
                      autoGrow_minHeight: 600,
                      // autoGrow_maxHeight: 600,
                      autoGrow_bottomSpace: 50,
                      filebrowserUploadUrl: `/api/uploadFile?authorization=${getAccessToken()}`,
                      filebrowserImageUploadUrl: `/api/uploadFile?authorization=${getAccessToken()}`,
                      uploadUrl: `/api/uploadFile?authorization=${getAccessToken()}`,
                      removeDialogTabs: 'image:advanced;link:advanced',
                      font_names:
                        '宋体/SimSun;新宋体/NSimSun;仿宋/FangSong;楷体/KaiTi;仿宋_GB2312/FangSong_GB2312;' +
                        '楷体_GB2312/KaiTi_GB2312;黑体/SimHei;华文细黑/STXihei;华文楷体/STKaiti;华文宋体/STSong;华文中宋/STZhongsong;' +
                        '华文仿宋/STFangsong;华文彩云/STCaiyun;华文琥珀/STHupo;华文隶书/STLiti;华文行楷/STXingkai;华文新魏/STXinwei;' +
                        '方正舒体/FZShuTi;方正姚体/FZYaoti;细明体/MingLiU;新细明体/PMingLiU;微软雅黑/Microsoft YaHei;微软正黑/Microsoft JhengHei;' +
                        'Arial Black/Arial Black;Arial/Arial;',
                    }}
                  />
                  :
                  <CodeMirror
                    value={this.state.data.content}
                    options={{
                      mode: 'xml',
                      lineNumbers: true,
                    }}
                    onBeforeChange={(editor, data, value) => {
                      this.setData('content', value)
                    }}
                  />}
              </Form.Item>
            </Form>

            <div
              style={{
                margin: '50px 0',
              }}
            >
              <Button
                type="primary"
                loading={this.state.loading1}
                onClick={() => {
                  this.setState(
                    {
                      loading1: true,
                    },
                    () => {
                      request_post('/api/savePdfTemplate', this.state.data).then(res => {
                        if (res.code === 200) {
                          message.success(res.message);
                          if (res.info.status === 0) {
                            window.location.href = '/template/approval';
                          } else {
                            window.location.href = '/template/list';
                          }

                        }
                        this.setState({loading1: false});
                      });
                    }
                  );
                }}
              >
                保存
              </Button>

              <Button
                style={{
                  marginLeft: 10,
                }}
                onClick={() => {
                  window.history.back();
                }}
              >
                取消
              </Button>

              <Button
                type="dashed"
                loading={this.state.loading2 || false}
                style={{
                  marginLeft: 10,
                }}
                onClick={() => {
                  this.setState(
                    {
                      loading2: true,
                    },
                    () => {
                      request_post('/api/downloadPdf', {
                        render_direction: this.state.data.render_direction,
                        content: this.state.data.content,
                      }).then(res => {
                        if (res.code === 200) {
                          window.open(res.info.file_url);
                        }
                        this.setState({loading2: false});
                      });
                    }
                  );
                }}
              >
                导出测试样板pdf
              </Button>
            </div>
          </Spin>
        </div>
      </div>
    );
  }
}

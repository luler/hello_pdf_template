import React, {Component} from 'react';
import {Input, Layout, Modal} from 'antd';
import Animate from 'rc-animate';
import {connect} from 'dva';
import GlobalHeader from '@/components/GlobalHeader';
import TopNavHeader from '@/components/TopNavHeader';
import styles from './Header.less';
import {getUserInfo, loginOut, setUserInfo} from "@/utils/authority";
import {request_post} from "@/utils/request_tool";

const {Header} = Layout;

class HeaderView extends Component {
  state = {
    visible: true,
    info: {},
  };

  static getDerivedStateFromProps(props, state) {
    if (!props.autoHideHeader && !state.visible) {
      return {
        visible: true,
      };
    }
    return null;
  }

  componentDidMount() {
    document.addEventListener('scroll', this.handScroll, {passive: true});
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handScroll);
  }

  getHeadWidth = () => {
    const {isMobile, collapsed, setting} = this.props;
    const {fixedHeader, layout} = setting;
    if (isMobile || !fixedHeader || layout === 'topmenu') {
      return '100%';
    }
    return collapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)';
  };

  handleMenuClick = ({key}) => {
    switch (key) {
      case 'logout':
        // 退出登录
        loginOut();
        break;
      case 'password':
        Modal.confirm({
          icon: false,
          content: <div>
            <span style={{color: 'red'}}>*</span> <span>请输入新密码:</span>
            <Input.Password placeholder='请输入' onChange={(e) => {
              this.setState({
                info: {
                  ...this.state.info,
                  password: e.target.value,
                }
              })
            }}/>
            <span style={{color: 'red'}}>*</span> <span>请输入确认密码:</span>
            <Input.Password placeholder='请输入' onChange={(e) => {
              this.setState({
                info: {
                  ...this.state.info,
                  password_confirm: e.target.value,
                }
              })
            }}/>
          </div>,
          okText: '保存',
          cancelText: '取消',
          onOk: (e) => {
            request_post('/api/editUserInfo', {
              ...this.state.info,
              type: 'password'
            }).then((res) => {
              if (res.code === 200) {
                e();
              }
            });
          }
        })
        break;
      case 'email':
        Modal.confirm({
          icon: false,
          content: <div>
            <span>您的邮箱:</span>
            <Input
              placeholder='请输入'
              type='email'
              defaultValue={getUserInfo().email}
              onChange={(e) => {
                this.setState({
                  info: {
                    ...this.state.info,
                    email: e.target.value,
                  }
                })
              }}/>
          </div>,
          okText: '保存',
          cancelText: '取消',
          onOk: (e) => {
            request_post('/api/editUserInfo', {
              ...this.state.info,
              type: 'email'
            }).then((res) => {
              if (res.code === 200) {
                const info = getUserInfo();
                info.email = this.state.info.email;
                setUserInfo(info);
                e();
              }
            });
          }
        })
        break;
      default:
        console.log(`点击下拉:${key}`);
        break;
    }
  };

  handScroll = () => {
    const {autoHideHeader} = this.props;
    const {visible} = this.state;
    if (!autoHideHeader) {
      return;
    }
    const scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
    if (!this.ticking) {
      this.ticking = true;
      requestAnimationFrame(() => {
        if (this.oldScrollTop > scrollTop) {
          this.setState({
            visible: true,
          });
        } else if (scrollTop > 300 && visible) {
          this.setState({
            visible: false,
          });
        } else if (scrollTop < 300 && !visible) {
          this.setState({
            visible: true,
          });
        }
        this.oldScrollTop = scrollTop;
        this.ticking = false;
      });
    }
  };

  render() {
    const {isMobile, handleMenuCollapse, setting} = this.props;
    const {navTheme, layout, fixedHeader} = setting;
    const {visible} = this.state;
    const isTop = layout === 'topmenu';
    const width = this.getHeadWidth();
    const HeaderDom = visible ? (
      <Header
        style={{padding: 0, width, zIndex: 2}}
        className={fixedHeader ? styles.fixedHeader : ''}
      >
        {isTop && !isMobile ? (
          <TopNavHeader
            theme={navTheme}
            mode="horizontal"
            onCollapse={handleMenuCollapse}
            onMenuClick={this.handleMenuClick}
            {...this.props}
          />
        ) : (
          <GlobalHeader
            onCollapse={handleMenuCollapse}
            onMenuClick={this.handleMenuClick}
            {...this.props}
          />
        )}
      </Header>
    ) : null;
    return (
      <Animate component="" transitionName="fade">
        {HeaderDom}
      </Animate>
    );
  }
}

export default connect(({global, setting}) => ({
  collapsed: global.collapsed,
  notices: global.notices,
  setting,
}))(HeaderView);

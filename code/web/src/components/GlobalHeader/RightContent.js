import React, {PureComponent} from 'react';
import {FormattedMessage} from 'umi-plugin-react/locale';
import {Menu, Icon, Button, Avatar} from 'antd';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import {getUserInfo} from '@/utils/authority';
import {extra_config} from "../../../config/extra.config";
import NoticeIcon from "@/components/NoticeIcon";
import {request_get} from "@/utils/request_tool";

export default class GlobalHeaderRight extends PureComponent {
  // state = {
  //   message_count: 0
  // };

  // componentDidMount() {
  //   if (getUserInfo().appid) {
  //     request_get('/api/getUnreadCommentCount').then((res) => {
  //       this.setState({
  //         message_count: res.info
  //       })
  //     })
  //   }
  // }

  render() {
    const {onMenuClick, theme} = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item key="password">
          <Icon type="key"/>
          设置密码
        </Menu.Item>
        {/*<Menu.Item key="email">*/}
        {/*  <Icon type="book"/>*/}
        {/*  我的邮箱*/}
        {/*</Menu.Item>*/}
        <Menu.Item key="logout">
          <Icon type="logout"/>
          <FormattedMessage id="menu.account.logout" defaultMessage="logout"/>
        </Menu.Item>
      </Menu>
    );
    let className = styles.right;
    if (theme === 'dark') {
      className = `${styles.right}  ${styles.dark}`;
    }
    return (
      <div className={className}>
        {getUserInfo().appid ?
          <div>
            {/*<a*/}
            {/*  href='/mycomment'*/}
            {/*>*/}
            {/*  <NoticeIcon*/}
            {/*    count={this.state.message_count}*/}
            {/*  />*/}
            {/*</a>*/}
            {/*&nbsp;*/}
            {/*&nbsp;*/}
            <HeaderDropdown overlay={menu}>
          <span className={`${styles.action} ${styles.account}`}>
            <Avatar
              src={getUserInfo().avatar}
            />
            &nbsp;
            &nbsp;
            <span className={styles.name}>{getUserInfo().appid}</span>
          </span>
            </HeaderDropdown>
          </div>

          :
          <div>
            <a href={extra_config.url401} style={{color: 'gray'}}>登录</a>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Button onClick={() => {
              window.location.href = `${extra_config.url401}?type=2`;
            }} type='primary'>注册</Button>
          </div>
        }

      </div>
    );
  }

}

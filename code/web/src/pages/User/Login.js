import React, {Component} from 'react';
import {connect} from 'dva';
import Login from '@/components/Login';
import styles from './Login.less';
import {request_post} from '@/utils/request_tool';
import {getQueryString} from '@/utils/utils';

const {UserName, Password, Submit} = Login;

@connect(({api, loading}) => ({
  api,
  submitting: loading.effects['api/getAccessToken'],
}))
class LoginPage extends Component {
  // eslint-disable-next-line react/sort-comp
  getDefaultActiveKey = () => {
    let type = getQueryString('type') || '1';
    if (['1', '2'].indexOf(type) === -1) {
      type = '1';
    }
    return type;
  };

  state = {
    type: this.getDefaultActiveKey(),
    mobile: '',
  };

  handleSubmit = (err, values) => {
    if (!err) {
      const {dispatch} = this.props;
      dispatch({
        type: 'api/getAccessToken',
        payload: {
          ...values,
          type: this.state.type,
        },
      });
    }
  };

  render() {
    const {submitting} = this.props;
    return (
      <div className={styles.main}>
        <Login
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <UserName
            name="appid"
            placeholder="请输入账号"
            rules={[
              {
                validator: (rule, value, callback) => {
                  if (this.state.type === '1' && value.trim() === '') {
                    callback('账号不能为空');
                  }
                  callback();
                },
              },
            ]}
          />
          <Password
            name="appsecret"
            placeholder="请输入密码"
            rules={[
              {
                validator: (rule, value, callback) => {
                  if (this.state.type === '1' && value.trim() === '') {
                    callback('密码不能为空');
                  }
                  callback();
                },
              },
            ]}
            onPressEnter={e => {
              e.preventDefault();
              this.loginForm.validateFields(this.handleSubmit);
            }}
          />

          <Submit loading={submitting}>登录</Submit>
        </Login>
      </div>
    );
  }
}

export default LoginPage;

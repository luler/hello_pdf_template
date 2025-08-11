import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import Link from 'umi/link';
import {Icon} from 'antd';
import DocumentTitle from 'react-document-title';
import GlobalFooter from '@/components/GlobalFooter';
import getPageTitle from '@/utils/getPageTitle';
import {getBaseSiteInfo} from "@/utils/commonInfo";
import styles from './UserLayout.less';

const links = [
  // {
  //   key: 'help',
  //   title: formatMessage({ id: 'layout.user.link.help' }),
  //   href: '',
  // },
  // {
  //   key: 'privacy',
  //   title: formatMessage({ id: 'layout.user.link.privacy' }),
  //   href: '',
  // },
  // {
  //   key: 'terms',
  //   title: formatMessage({ id: 'layout.user.link.terms' }),
  //   href: '',
  // },
];

const copyright = (
  <Fragment>
    Copyright <Icon type="copyright"/> 2019 Designed by 1207032539@qq.com
  </Fragment>
);

class UserLayout extends Component {
  componentDidMount() {
    const {
      dispatch,
      route: {routes, authority},
    } = this.props;
    dispatch({
      type: 'menu/getMenuData',
      payload: {routes, authority},
    });
  }

  render() {
    const {
      children,
      location: {pathname},
      breadcrumbNameMap,
    } = this.props;
    // console.log(this.props);
    return (
      <DocumentTitle title={getPageTitle(pathname, breadcrumbNameMap)}>
        <div className={styles.container}>
          <div className={styles.lang}>{/*<SelectLang/>*/}</div>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src={getBaseSiteInfo().site_icon}/>
                  <span className={styles.title}>{getBaseSiteInfo().site_title}</span>
                </Link>
              </div>
              <div className={styles.desc}>
                本系统可实现简单的pdf模板制作，使用富文本编辑器构建模板基础，可设置参数，通过接口调用的形式传递参数并生成pdf文件
              </div>
            </div>
            {children}
          </div>
          <GlobalFooter links={links} copyright={copyright}/>
        </div>
      </DocumentTitle>
    );
  }
}

export default connect(({menu: menuModel}) => ({
  menuData: menuModel.menuData,
  breadcrumbNameMap: menuModel.breadcrumbNameMap,
}))(UserLayout);

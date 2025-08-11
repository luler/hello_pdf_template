import {Component} from 'react';
import {message} from 'antd';
import {getBaseSiteInfo} from "@/utils/commonInfo";

class BasePage extends Component {
  constructor() {
    super();
    message.config({
      top: 100,
      duration: 2,
      maxCount: 3,
    });

    // 动态设置favicon
    const linkIcon = document.querySelector("link[rel='icon']");
    linkIcon.href = getBaseSiteInfo().site_icon
  }
}

export default BasePage;

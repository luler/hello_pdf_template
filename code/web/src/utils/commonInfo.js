import {getStorage, removeStorage, setStorage} from "@/utils/utils";
import {title} from "@/defaultSettings";
import logo from '../assets/icon.png';

/**
 * 获取网站配置信息
 * @returns {string|number|boolean}
 */
export function getBaseSiteInfo() {
  // let res = getStorage('base_site_info');
  // if (!res) {
  //   const xmlhttp = new XMLHttpRequest();
  //   xmlhttp.open('GET', '/api/getBaseSiteInfo', false);
  //   xmlhttp.send(null);
  //   res = JSON.parse(xmlhttp.responseText).info;
  //   setStorage('base_site_info', {
  //     site_title: title,
  //     site_icon: logo,
  //     ...res,
  //   }, 60 * 5); // 存储5分钟
  //   res = getStorage('base_site_info');
  // }
  // return res;
  return {
    site_title: title,
    site_icon: logo,
  }
}

/**
 * 清空网站配置信息
 */
export function removeBaseSiteInfo() {
  removeStorage('base_site_info');
}

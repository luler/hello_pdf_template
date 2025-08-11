import {formatMessage} from 'umi-plugin-react/locale';
import pathToRegexp from 'path-to-regexp';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import {getBaseSiteInfo} from "@/utils/commonInfo";
import {menu} from '../defaultSettings';

export const matchParamsPath = (pathname, breadcrumbNameMap) => {
  const pathKey = Object.keys(breadcrumbNameMap).find(key => pathToRegexp(key).test(pathname));
  return breadcrumbNameMap[pathKey];
};

const getPageTitle = (pathname, breadcrumbNameMap) => {
  const currRouterData = matchParamsPath(pathname, breadcrumbNameMap);
  if (!currRouterData) {
    return getBaseSiteInfo().site_title;
  }
  const pageName = menu.disableLocal
    ? currRouterData.name
    : formatMessage({
      id: currRouterData.locale || currRouterData.name,
      defaultMessage: currRouterData.name,
    });

  return `${pageName} - ${getBaseSiteInfo().site_title}`;
};

export default memoizeOne(getPageTitle, isEqual);

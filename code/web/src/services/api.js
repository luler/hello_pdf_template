import {stringify} from 'qs';
import request from '@/utils/request';

export async function queryNotices(params = {}) {
  return request(`/api/notices?${stringify(params)}`);
}

export async function getAccessToken(params = {}) {
  return request(`/api/getAccessToken`, {
    method: 'POST',
    data: params,
  });
}

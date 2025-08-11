import {
  getAccessToken,
} from '../services/api';
import {setAccessToken, setAuthority, setUserInfo} from '../utils/authority';
import {reloadAuthorized} from '@/utils/Authorized';
import {getPageQuery} from "@/utils/utils";

export default {
  namespace: 'api',
  state: {},

  effects: {
    * getAccessToken({payload}, {call, put}) {
      const response = yield call(getAccessToken, payload);
      if (response.code === 200) {
        setUserInfo(response.info.user_info, response.info.expires_in);
        yield put({
          type: 'login',
          payload: response.info,
        });

        reloadAuthorized();
        const {redirect} = getPageQuery();
        let url = '/';
        if (redirect) {
          url = redirect;
        }
        window.location.href = url;
      }
    },

  },

  reducers: {
    login(state, {payload}) {
      if (payload.user_info.is_admin === 1) {
        setAuthority(['super_admin']);
      } else {
        setAuthority(['guest']);
      }
      setAccessToken(payload.access_token);
      return {
        ...state,
      };
    },

  },
};

export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      {path: '/user', redirect: '/user/login'},
      {path: '/user/login', name: 'login', component: './User/Login'},
      {
        component: '404',
      },
    ],
  },
  // frontend
  {
    path: '/frontend',
    component: '../layouts/BlankLayout',
    routes: [
      {path: '/frontend/casLogin', name: 'login', component: './Frontend/CasLogin'},
      {
        component: '404',
      },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      {path: '/', redirect: '/template/list'},
      {
        path: '/template',
        name: '模板管理',
        icon: 'file-pdf',
        routes: [
          {
            path: '/template/list',
            name: '模板列表',
            component: './Template/Template',
          },
          {
            path: '/template/approval',
            name: '模板审核',
            component: './Template/TemplateApproval',
          },
          {
            path: '/template/save/:id',
            name: '模板内容',
            hideInMenu: true,
            component: './Template/TemplateSave',
          },
        ],
      },
      {
        path: '/management/user',
        name: '用户管理',
        icon: 'user',
        authority: ['super_admin'],
        component: './User/User',
      },
      {
        component: '404',
      },
    ],
  },
];

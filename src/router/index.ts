/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import { isAuthenticate } from '../middleware/auth';
import VueRouter, { RouteConfig } from 'vue-router';
// import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue';
import HomeLayout from '../layout/HomeLayout.vue';
import { create } from 'domain';

export function routerInit(vue: any) {
  vue.use(VueRouter);
}

const getLoginRedirect = () => {
  let url = process.env.SPINAL_API_URL;
  url = url?.endsWith('/') ? url.substring(0, url.length - 1) : url;
  return url + '/login';
}


const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: '/home',
    name: '_Home',
  },
  {
    path: '/admin',
    name: 'AdminLogin',
    component: LoginView,
  },
  {
    name: "Login",
    path: '/login'
  },
  {
    path: '/app',
    name: 'App',
    component: () => import('../views/ApplicationView.vue'),
  },
  {
    path: '/',
    component: HomeLayout,
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () =>
          import(/* webpackChunkName: "about" */ '../views/HomeView.vue'),
      },
    ],
  },
];

const router = new VueRouter({
  // mode: 'history',
  routes,
});


router.beforeEach(async (to, from, next) => {
  const auth = await isAuthenticate();
  const isConnectionPage = ['Login', 'AdminLogin'].includes(to.name);

  if (to.name === 'Login' && !auth) {
    location.href = getLoginRedirect();
    return;
  }
  if (!auth && !isConnectionPage) return next({ name: 'Login' });
  if (isConnectionPage && auth) return next({ name: "Home" });


  return next();
});

router.customPush = function (path, query) {
  this.push({ path, query });
};

router.customReplace = function (path, query) {
  this.replace({ path, query });
};


window.routerFontion = router;
export { router };

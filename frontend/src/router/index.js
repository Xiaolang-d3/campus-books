import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import authStorage from '@/utils/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/home',
    children: [
      { path: 'home', name: '系统首页', component: () => import('@/views/Home.vue') },
      { path: 'center', name: '个人信息', component: () => import('@/views/Center.vue') },
      { path: 'password', name: '修改密码', component: () => import('@/views/Password.vue') },
      { path: 'yonghu', name: '用户管理', component: () => import('@/views/modules/yonghu/List.vue') },
      { path: 'college', name: '学院管理', component: () => import('@/views/modules/college/List.vue') },
      { path: 'major', name: '专业管理', component: () => import('@/views/modules/major/List.vue') },
      { path: 'shujifenlei', name: '书籍分类', component: () => import('@/views/modules/shujifenlei/List.vue') },
      { path: 'book', name: '二手书籍', component: () => import('@/views/modules/ershoushuji/List.vue') },
      { path: 'orders/:status?', name: '订单管理', component: () => import('@/views/modules/orders/List.vue') },
      { path: 'news', name: '公告信息', component: () => import('@/views/modules/news/List.vue') },
      { path: 'aboutus', name: '关于我们', component: () => import('@/views/modules/aboutus/List.vue') },
      { path: 'systemintro', name: '系统简介', component: () => import('@/views/modules/systemintro/List.vue') },
      { path: 'review', name: '书籍评论', component: () => import('@/views/modules/discuss/List.vue') },
      { path: 'config', name: '轮播图管理', component: () => import('@/views/modules/config/List.vue') },
    ],
  },
  {
    path: '/front',
    component: () => import('@/views/front/FrontLayout.vue'),
    redirect: '/front/home',
    children: [
      { path: 'home', name: '前台首页', component: () => import('@/views/front/MinimalHome.vue') },
      { path: 'books', name: '书籍列表', component: () => import('@/views/front/BookList.vue') },
      { path: 'book/:id', name: '书籍详情', component: () => import('@/views/front/BookDetail.vue') },
      { path: 'cart', name: '购物车', component: () => import('@/views/front/CartPage.vue'), meta: { auth: true } },
      { path: 'order-confirm', name: '确认订单', component: () => import('@/views/front/OrderConfirm.vue'), meta: { auth: true } },
      { path: 'payment/:id', name: '订单支付', component: () => import('@/views/front/Payment.vue'), meta: { auth: true } },
      { path: 'orders', name: '我的订单', component: () => import('@/views/front/MyOrders.vue'), meta: { auth: true } },
      { path: 'publish', name: '发布书籍', component: () => import('@/views/front/PublishBook.vue'), meta: { auth: true } },
      { path: 'my-books', name: '我的发布', component: () => import('@/views/front/MyBooks.vue'), meta: { auth: true } },
      { path: 'wallet', name: '我的钱包', component: () => import('@/views/front/Wallet.vue'), meta: { auth: true } },
      { path: 'address', name: '地址管理', component: () => import('@/views/front/AddressManage.vue'), meta: { auth: true } },
      { path: 'storeup', name: '我的收藏', component: () => import('@/views/front/MyStoreup.vue'), meta: { auth: true } },
      { path: 'ai-chat', name: 'AI助手', component: () => import('@/views/front/AIChat.vue') },
      { path: 'news', name: '前台公告', component: () => import('@/views/front/NewsList.vue') },
      { path: 'news/:id', name: '公告详情', component: () => import('@/views/front/NewsDetail.vue') },
      { path: 'center', name: '前台个人中心', component: () => import('@/views/front/FrontCenter.vue'), meta: { auth: true } },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = authStorage.get('token')
  const role = authStorage.get('role')
  
  // 前台路由需要登录的页面
  if (to.meta?.auth && !token) {
    next('/login')
    return
  }
  
  // 后台路由权限检查（非前台、非登录注册页面）
  if (!to.path.startsWith('/front') && to.path !== '/login' && to.path !== '/register') {
    // 未登录，跳转登录页
    if (!token) {
      next('/login')
      return
    }
    // 已登录但不是管理员，禁止访问后台
    if (role !== 'admin') {
      ElMessage.warning('您没有权限访问管理后台')
      next('/front/home')
      return
    }
  }
  
  next()
})

export default router

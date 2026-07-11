<template>
  <div class="front-layout">
    <!-- 移动端遮罩层 -->
    <div v-if="showMobileMenu" class="mobile-overlay" @click="showMobileMenu = false" />

    <!-- 顶部导航 -->
    <el-header :class="['front-header', { scrolled: isScrolled }]">
      <div class="header-inner">
        <!-- Logo -->
        <div class="logo" @click="$router.push('/front/home')">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="logo-text">校园二手专业书籍在线交易平台</span>
        </div>

        <!-- 桌面端导航 -->
        <nav class="nav-links" aria-label="主导航">
          <a
            v-for="item in navItems"
            :key="item.path"
            v-show="!item.auth || isLogin"
            :class="['nav-link', { active: $route.path === item.path }]"
            @click="$router.push(item.path)"
          >
            {{ item.label }}
          </a>
        </nav>

        <!-- 右侧操作区 -->
        <div class="header-actions">
          <!-- 已登录 -->
          <template v-if="isLogin">
            <el-dropdown trigger="click" @command="handleUserMenuCommand">
              <div class="user-btn" title="个人中心">
                <img
                  v-if="userAvatar"
                  :src="getImg(userAvatar)"
                  :class="['avatar', { 'avatar-loaded': avatarLoaded }]"
                  alt="头像"
                  @load="avatarLoaded = true"
                  @error="handleAvatarError"
                />
                <div v-else class="avatar">{{ username[0]?.toUpperCase() }}</div>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="center">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="orders">
                    <el-icon><Document /></el-icon>
                    我的订单
                  </el-dropdown-item>
                  <el-dropdown-item command="storeup">
                    <el-icon><Star /></el-icon>
                    我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item command="address">
                    <el-icon><Location /></el-icon>
                    收货地址
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>

          <!-- 未登录 -->
          <template v-else>
            <button class="auth-btn login" @click="$router.push('/login')">登录</button>
            <button class="auth-btn signup" @click="$router.push('/register')">注册</button>
          </template>

          <!-- 移动端汉堡按钮 -->
          <el-icon class="hamburger-btn" @click="showMobileMenu = true">
            <DArrowLeft v-if="false" />
            <MoreFilled />
          </el-icon>
        </div>
      </div>

    </el-header>

    <!-- 移动端侧边抽屉导航 -->
    <transition name="slide-left">
      <aside v-if="showMobileMenu" class="mobile-drawer">
        <div class="mobile-drawer__header">
          <div class="logo" @click="$router.push('/front/home'); showMobileMenu = false">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="logo-text">校园二手专业书籍在线交易平台</span>
          </div>
          <el-icon class="close-btn" @click="showMobileMenu = false"><Close /></el-icon>
        </div>

        <nav class="mobile-nav">
          <a
            v-for="item in navItems"
            :key="item.path"
            v-show="!item.auth || isLogin"
            :class="['mobile-nav__link', { active: $route.path === item.path }]"
            @click="$router.push(item.path); showMobileMenu = false"
          >
            <el-icon><HomeFilled v-if="item.path === '/front/home'" /><Reading v-else /></el-icon>
            {{ item.label }}
          </a>
        </nav>

        <div class="mobile-drawer__divider" />

        <nav class="mobile-nav mobile-nav--user">
          <a class="mobile-nav__link" @click="$router.push('/front/cart'); showMobileMenu = false">
            <el-icon><ShoppingCart /></el-icon>
            购物车
          </a>
          <a v-if="!isLogin" class="mobile-nav__link" @click="$router.push('/login'); showMobileMenu = false">
            <el-icon><User /></el-icon>
            登录 / 注册
          </a>
          <template v-else>
            <a class="mobile-nav__link" @click="$router.push('/front/ai-chat'); showMobileMenu = false">
              <el-icon><ChatDotRound /></el-icon>
              AI 助手
            </a>
            <a class="mobile-nav__link" @click="$router.push('/front/center'); showMobileMenu = false">
              <el-icon><User /></el-icon>
              个人中心
            </a>
            <a class="mobile-nav__link" @click="$router.push('/front/orders'); showMobileMenu = false">
              <el-icon><Document /></el-icon>
              我的订单
            </a>
            <a class="mobile-nav__link" @click="$router.push('/front/storeup'); showMobileMenu = false">
              <el-icon><Star /></el-icon>
              我的收藏
            </a>
            <a class="mobile-nav__link" @click="$router.push('/front/address'); showMobileMenu = false">
              <el-icon><Location /></el-icon>
              收货地址
            </a>
            <a class="mobile-nav__link mobile-nav__link--danger" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </a>
          </template>
        </nav>
      </aside>
    </transition>

    <!-- 页面内容 -->
    <el-main :class="['front-main', { 'front-main--chat': route.path === '/front/ai-chat' }]">
      <router-view />
    </el-main>

    <!-- 购物车悬浮按钮 -->
    <div v-if="isLogin && route.path !== '/front/cart'" class="cart-fab" @click="$router.push('/front/cart')" title="购物车">
      <el-badge :value="cartCount" :hidden="!cartCount" class="cart-fab-badge">
        <el-icon :size="24"><ShoppingCart /></el-icon>
      </el-badge>
    </div>

    <!-- AI 助手悬浮按钮 -->
    <div v-if="route.path !== '/front/ai-chat'" class="ai-fab" @click="$router.push('/front/ai-chat')" title="AI 助手">
      <el-icon :size="26"><ChatDotRound /></el-icon>
    </div>

    <!-- 底部 -->
    <el-footer v-if="route.path !== '/front/ai-chat'" class="front-footer">
      <div class="footer-inner">
        <div class="footer-info">
          <span class="footer-logo-text">校园二手专业书籍在线交易平台</span>
          <span class="footer-divider-line">|</span>
          <span class="footer-copy">© 2026</span>
        </div>
      </div>
    </el-footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ShoppingCart,
  HomeFilled, Reading, Document, Star, Location,
  User, Close, MoreFilled, SwitchButton, MagicStick, ChatDotRound
} from '@element-plus/icons-vue'
import http from '@/utils/http'
import { resolveAvatarUrl } from '@/utils/avatar'
import authStorage from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const isLogin = ref(authStorage.hasToken())
const username = ref(authStorage.get('username') || '')
const userAvatar = ref(authStorage.get('avatar') || '')
const cartCount = ref(0)
const showMobileMenu = ref(false)
const isScrolled = ref(false)
const avatarLoaded = ref(false)

const syncUserState = () => {
  isLogin.value = authStorage.hasToken()
  username.value = authStorage.get('username') || ''
  const newAvatar = authStorage.get('avatar') || ''
  if (newAvatar !== userAvatar.value) {
    userAvatar.value = newAvatar
    avatarLoaded.value = false // 重置加载状态
  }
  if (!isLogin.value) {
    cartCount.value = 0
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

const navItems = [
  { label: '首页', path: '/front/home' },
  { label: '书籍市场', path: '/front/books' },
  { label: '发布闲置', path: '/front/publish', auth: true },
  { label: '我的订单', path: '/front/orders', auth: true },
  { label: '我的收藏', path: '/front/storeup', auth: true },
]

const loadCartCount = async () => {
  if (!isLogin.value) return
  try {
    const res = await http.get('/cart/page', { params: { page: 1, limit: 999 } })
    cartCount.value = res.data?.data?.total || 0
  } catch {}
}

const loadUserInfo = async () => {
  if (!isLogin.value) return
  const uid = authStorage.get('userid')
  if (!uid) return
  try {
    const res = await http.get(`/yonghu/info/${uid}`)
    if (res.data?.code === 0 && res.data?.data) {
      // 只在头像真的变化时才更新，避免闪烁
      const newAvatar = res.data.data.avatar || ''
      if (newAvatar && newAvatar !== userAvatar.value) {
        userAvatar.value = newAvatar
        authStorage.set('avatar', newAvatar)
      }
    }
  } catch {}
}

const handleLogout = () => {
  authStorage.clear()
  isLogin.value = false
  username.value = ''
  userAvatar.value = ''
  cartCount.value = 0
  showMobileMenu.value = false
  router.push('/front/home')
}

const handleUserMenuCommand = (command) => {
  switch (command) {
    case 'center':
      router.push('/front/center')
      break
    case 'orders':
      router.push('/front/orders')
      break
    case 'storeup':
      router.push('/front/storeup')
      break
    case 'address':
      router.push('/front/address')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleAvatarUpdate = (event) => {
  userAvatar.value = event.detail.avatar
}

const handleAvatarError = () => {
  // 头像加载失败时，清空头像显示默认
  userAvatar.value = ''
}

watch(
  () => route.path,
  () => {
    syncUserState()
    showMobileMenu.value = false
    if (isLogin.value) {
      loadCartCount()
      // 只在首次加载或头像为空时才重新获取用户信息
      if (!userAvatar.value) {
        loadUserInfo()
      }
    }
  }
)

onMounted(() => {
  syncUserState()
  loadCartCount()
  loadUserInfo()
  window.addEventListener('avatar-updated', handleAvatarUpdate)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('avatar-updated', handleAvatarUpdate)
  window.removeEventListener('scroll', handleScroll)
})

const getImg = (v) => resolveAvatarUrl(v)
</script>

<style scoped>
/* —— 设计变量：与登录页保持一致 —— */
* {
  box-sizing: border-box;
}

.front-layout {
  --front-accent: #2563eb;
  --front-accent-hover: #1d4ed8;
  --front-ink: #0f172a;
  --front-muted: #64748b;
  --front-line: #e2e8f0;
  --front-bg: #f8fafc;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--front-bg);
}

/* —— 顶部导航 —— */
.front-header {
  background: #ffffff;
  padding: 0;
  border-bottom: 1px solid var(--front-line);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.front-header.scrolled {
  border-bottom-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.logo:hover {
  opacity: 0.75;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: var(--front-ink);
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--front-ink);
  letter-spacing: 0.02em;
  white-space: nowrap;
  display: none;
}

/* 桌面端导航 */
.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
  margin-right: 16px;
}

.nav-link {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--front-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 10px;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--front-ink);
  background-color: var(--front-bg);
}

.nav-link.active {
  color: var(--front-accent);
  font-weight: 600;
  background: rgba(37, 99, 235, 0.08);
}

/* 右侧操作区 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  border: 2px solid transparent;
}

.user-btn:hover {
  border-color: var(--front-line);
  transform: scale(1.05);
}

/* 下拉菜单样式优化 */
:deep(.el-dropdown-menu) {
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.15);
  border: 1px solid var(--front-line);
}

:deep(.el-dropdown-menu__item) {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background: var(--front-bg);
  color: var(--front-accent);
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  object-fit: cover;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

/* 图片头像加载优化 */
img.avatar {
  opacity: 0;
  transition: opacity 0.2s ease;
}

img.avatar.avatar-loaded {
  opacity: 1;
}

.username-text {
  display: none;
}

.auth-btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.auth-btn.login {
  background: transparent;
  color: var(--front-ink);
  border: 1px solid var(--front-line);
}

.auth-btn.login:hover {
  background: var(--front-bg);
  border-color: #cbd5e1;
}

.auth-btn.signup {
  background: var(--front-accent);
  color: #fff;
  border: 1px solid var(--front-accent);
}

.auth-btn.signup:hover {
  background: var(--front-accent-hover);
  border-color: var(--front-accent-hover);
}

/* 汉堡菜单按钮 */
.hamburger-btn {
  display: none;
  font-size: 20px;
  color: var(--front-ink);
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: transparent;
  border: 1px solid transparent;
}

.hamburger-btn:hover {
  background: var(--front-bg);
  border-color: var(--front-line);
}

/* —— 移动端抽屉 —— */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: #fff;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 32px rgba(15, 23, 42, 0.15);
  overflow-y: auto;
}

.mobile-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 64px;
  border-bottom: 1px solid var(--front-line);
  flex-shrink: 0;
}

.mobile-drawer__header .logo-text {
  display: inline;
}

.close-btn {
  font-size: 20px;
  color: var(--front-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--front-bg);
  color: var(--front-ink);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.mobile-nav--user {
  border-top: none;
}

.mobile-nav__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 15px;
  color: var(--front-ink);
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s;
  text-decoration: none;
  font-weight: 500;
}

.mobile-nav__link:hover {
  background: var(--front-bg);
}

.mobile-nav__link.active {
  color: var(--front-accent);
  font-weight: 600;
  background: rgba(37, 99, 235, 0.08);
}

.mobile-nav__link--danger {
  color: #ef4444;
}

.mobile-drawer__divider {
  height: 1px;
  background: var(--front-line);
  margin: 8px 16px;
}

/* —— 侧边栏滑入动画 —— */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}

/* —— 主内容区 —— */
.front-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
}

.front-main--chat {
  max-width: 1200px;
  padding: 20px 24px 0;
}

/* —— 购物车悬浮按钮 —— */
.cart-fab {
  position: fixed;
  right: 32px;
  bottom: 240px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff;
  color: var(--front-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
  border: 2px solid var(--front-line);
}

.cart-fab:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.2);
  border-color: var(--front-accent);
  color: var(--front-accent);
}

.cart-fab:active {
  transform: translateY(-2px) scale(1.02);
}

.cart-fab-badge :deep(.el-badge__content) {
  background: #ef4444;
  border: 2px solid #fff;
  font-weight: 600;
  font-size: 11px;
  min-width: 20px;
  height: 20px;
  line-height: 16px;
  padding: 0 5px;
  border-radius: 10px;
  top: -2px;
  right: -2px;
}

/* —— AI 助手悬浮按钮 —— */
.ai-fab {
  position: fixed;
  right: 32px;
  bottom: 168px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--front-accent) 0%, var(--front-accent-hover) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
}

.ai-fab:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
}

.ai-fab:active {
  transform: translateY(-2px) scale(1.02);
}

.ai-fab .el-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.front-footer {
  --el-footer-height: auto;
  --el-footer-padding: 0;
  height: auto;
  min-height: 0;
  overflow: visible;
  background: linear-gradient(165deg, #0f172a 0%, #1e293b 48%, #0f172a 100%);
  border-top: 1px solid rgba(248, 250, 252, 0.08);
  padding: 28px 0;
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-logo-text {
  font-size: 13px;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.75);
  letter-spacing: 0.02em;
}

.footer-divider-line {
  color: rgba(248, 250, 252, 0.3);
  font-size: 13px;
}

.footer-copy {
  font-size: 13px;
  color: rgba(248, 250, 252, 0.5);
}

/* —— 响应式断点 —— */

/* 平板断点（导航隐藏，改用汉堡） */
@media (max-width: 968px) {
  .header-inner {
    gap: 12px;
  }

  .nav-links {
    display: none;
  }

  .hamburger-btn {
    display: flex;
  }
}

/* 移动端（完全重构顶部栏） */
@media (max-width: 768px) {
  .header-inner {
    height: 56px;
    padding: 0 12px;
    gap: 8px;
  }

  .logo-icon {
    width: 26px;
    height: 26px;
  }

  .logo-text {
    display: none;
  }

  .header-search-icon {
    width: 36px;
    height: 36px;
  }

  .header-search-icon .el-icon {
    font-size: 18px;
  }

  .username-text {
    display: none;
  }

  .user-btn {
    padding: 4px 10px 4px 4px;
    gap: 8px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }

  .auth-btn {
    padding: 0 16px;
    font-size: 13px;
    height: 36px;
  }

  .hamburger-btn {
    padding: 8px;
  }

  .front-main {
    padding: 16px;
    padding-bottom: 24px;
  }

  .front-main--chat {
    padding: 0;
  }

  .cart-fab {
    right: 20px;
    bottom: 228px;
    width: 52px;
    height: 52px;
  }

  .cart-fab-badge :deep(.el-badge__content) {
    font-size: 10px;
    min-width: 18px;
    height: 18px;
    line-height: 14px;
  }

  .ai-fab {
    right: 20px;
    bottom: 156px;
    width: 52px;
    height: 52px;
  }

  .ai-fab .el-icon {
    font-size: 22px;
  }

  .front-footer {
    padding: 20px 0;
  }

  .footer-info {
    gap: 6px;
  }

  .footer-logo-text,
  .footer-divider-line,
  .footer-copy {
    font-size: 12px;
  }
}

/* 超小屏幕 */
@media (max-width: 480px) {
  .header-inner {
    padding: 0 12px;
    gap: 8px;
  }

  .logo-icon {
    width: 24px;
    height: 24px;
  }

  .logo-text {
    display: none;
  }

  .auth-btn {
    padding: 0 12px;
    height: 32px;
    font-size: 13px;
  }

  .front-main {
    padding: 12px;
  }

  .front-main--chat {
    padding: 0;
  }
}
</style>

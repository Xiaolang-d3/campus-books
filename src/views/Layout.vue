<template>
  <el-container class="admin-layout">
    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && !isCollapse"
      class="drawer-overlay"
      @click="isCollapse = true"
    />

    <!-- 侧边栏 -->
    <el-aside
      :width="isCollapse ? '0px' : isMobile ? '260px' : '220px'"
      :class="['admin-aside', { 'is-collapsed': isCollapse, 'admin-aside--drawer': isMobile }]"
    >
      <div class="logo">
        <span class="logo-text" v-show="!isCollapse">二手书籍交易平台</span>
        <span class="logo-icon-only" v-show="isCollapse">书</span>
      </div>
      <el-menu
        :default-active="$route.path"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
        unique-opened
        :collapse-transition="false"
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <span>系统首页</span>
        </el-menu-item>

        <template v-if="role === 'admin'">
          <el-sub-menu index="user-mgmt">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/yonghu">用户列表</el-menu-item>
            <el-menu-item index="/college">学院管理</el-menu-item>
            <el-menu-item index="/major">专业管理</el-menu-item>
          </el-sub-menu>
        </template>

        <el-sub-menu index="book-mgmt">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>书籍管理</span>
          </template>
          <el-menu-item index="/shujifenlei" v-if="role === 'admin'">书籍分类</el-menu-item>
          <el-menu-item index="/book">{{ role === 'admin' ? '二手书籍' : '我的书籍' }}</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="order-mgmt">
          <template #title>
            <el-icon><ShoppingCart /></el-icon>
            <span>{{ role === 'admin' ? '订单管理' : '我的订单' }}</span>
          </template>
          <el-menu-item index="/orders/未支付">未支付</el-menu-item>
          <el-menu-item index="/orders/已支付">已支付</el-menu-item>
          <el-menu-item index="/orders/已发货">已发货</el-menu-item>
          <el-menu-item index="/orders/已完成">已完成</el-menu-item>
          <el-menu-item index="/orders/已退款">已退款</el-menu-item>
        </el-sub-menu>

        <template v-if="role === 'admin'">
          <el-sub-menu index="content-mgmt">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>内容管理</span>
            </template>
            <el-menu-item index="/news">公告信息</el-menu-item>
            <el-menu-item index="/aboutus">关于我们</el-menu-item>
            <el-menu-item index="/systemintro">系统简介</el-menu-item>
            <el-menu-item index="/config">轮播图管理</el-menu-item>
          </el-sub-menu>
        </template>

        <el-menu-item index="/review" v-if="role === 'admin'">
          <el-icon><ChatDotRound /></el-icon>
          <span>书籍评论</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="admin-main-container">
      <!-- 顶部导航 -->
      <el-header class="admin-header">
        <!-- 移动端汉堡菜单按钮 -->
        <el-icon class="menu-toggle" @click="isCollapse = !isCollapse">
          <Fold v-if="isCollapse" />
          <Expand v-else />
        </el-icon>

        <!-- 移动端logo（仅折叠时显示） -->
        <span class="header-mobile-logo hide-on-desktop">二手书籍交易平台</span>

        <div class="header-right">
          <el-dropdown @command="handleCommand" trigger="click">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              <span class="user-name hide-on-mobile">{{ roleName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="center">个人信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  HomeFilled, User, Reading, ShoppingCart, Document,
  ChatDotRound, Fold, Expand, UserFilled, ArrowDown
} from '@element-plus/icons-vue'
import authStorage from '@/utils/auth'

const router = useRouter()
const isCollapse = ref(false)
const isMobile = ref(false)
const role = authStorage.get('role') || 'admin'
const roleMap = { admin: '管理员', yonghu: '用户' }
const roleName = computed(() => roleMap[role] || role)

const checkMobile = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 769
  // 首次进入移动端时自动折叠侧边栏
  if (!wasMobile && isMobile.value) {
    isCollapse.value = true
  }
  // 从移动端切回桌面时恢复展开
  if (wasMobile && !isMobile.value) {
    isCollapse.value = false
  }
}

const handleCommand = (cmd) => {
  if (cmd === 'logout') {
    authStorage.clear()
    router.push('/login')
    return
  }
  router.push(`/${cmd}`)
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* —— 设计变量：与登录页保持一致 —— */
.admin-layout {
  --admin-accent: #2563eb;
  --admin-accent-hover: #1d4ed8;
  --admin-ink: #0f172a;
  --admin-muted: #64748b;
  --admin-line: #e2e8f0;
  --admin-bg: #f8fafc;
  --admin-sidebar: #0f172a;
  --admin-sidebar-hover: #1e293b;

  min-height: 100vh;
  position: relative;
  background: var(--admin-bg);
}

/* —— 侧边栏 —— */
.admin-aside {
  background: linear-gradient(165deg, var(--admin-sidebar) 0%, #1e293b 48%, var(--admin-sidebar) 100%);
  overflow-x: hidden;
  overflow-y: auto;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2001;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
  box-shadow: 4px 0 24px rgba(15, 23, 42, 0.12);
}

/* 移动端抽屉模式 */
.admin-aside--drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  box-shadow: 4px 0 32px rgba(15, 23, 42, 0.2);
}

.admin-aside.is-collapsed {
  width: 0 !important;
  overflow: hidden;
}

/* —— Logo —— */
.logo {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f8fafc;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  padding: 0 16px;
  border-bottom: 1px solid rgba(248, 250, 252, 0.08);
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  letter-spacing: 0.06em;
}

.logo-icon-only {
  font-size: 20px;
}

/* —— 菜单样式 —— */
.admin-aside :deep(.el-menu) {
  border: none;
  background: transparent;
}

.admin-aside :deep(.el-menu-item),
.admin-aside :deep(.el-sub-menu__title) {
  border-radius: 10px;
  margin: 4px 12px;
  padding-left: 20px !important;
  color: rgba(248, 250, 252, 0.7);
  transition: all 0.2s ease;
}

.admin-aside :deep(.el-menu-item:hover),
.admin-aside :deep(.el-sub-menu__title:hover) {
  background: rgba(248, 250, 252, 0.08) !important;
  color: #f8fafc;
}

.admin-aside :deep(.el-menu-item.is-active) {
  background: rgba(37, 99, 235, 0.15) !important;
  color: #60a5fa !important;
  font-weight: 500;
}

.admin-aside :deep(.el-sub-menu .el-menu-item) {
  margin: 2px 12px 2px 24px;
  padding-left: 32px !important;
  font-size: 13px;
}

.admin-aside :deep(.el-icon) {
  color: inherit;
}

/* —— 主内容区 —— */
.admin-main-container {
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

/* —— 顶部导航 —— */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--admin-line);
  background: #fff;
  padding: 0 20px 0 0 !important;
  height: 64px !important;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.menu-toggle {
  cursor: pointer;
  font-size: 20px;
  color: var(--admin-ink);
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.menu-toggle:hover {
  color: var(--admin-accent);
}

.header-mobile-logo {
  font-size: 16px;
  font-weight: 700;
  color: var(--admin-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  letter-spacing: 0.02em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  transition: background 0.2s;
  color: var(--admin-ink);
  font-size: 14px;
  font-weight: 500;
}

.user-info:hover {
  background: var(--admin-bg);
}

.user-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* —— 主内容 —— */
.admin-main {
  background: var(--admin-bg);
  padding: 20px !important;
  min-height: calc(100vh - 64px);
}

/* —— 遮罩层 —— */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 2000;
  backdrop-filter: blur(4px);
}

/* —— 全局卡片样式优化 —— */
.admin-main :deep(.el-card) {
  border: 1px solid var(--admin-line);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.admin-main :deep(.el-button--primary) {
  background: var(--admin-accent);
  border-color: var(--admin-accent);
}

.admin-main :deep(.el-button--primary:hover) {
  background: var(--admin-accent-hover);
  border-color: var(--admin-accent-hover);
}

/* —— 响应式 —— */
@media (max-width: 768px) {
  .admin-header {
    padding: 0 12px 0 0 !important;
    height: 56px !important;
  }

  .menu-toggle {
    padding: 0 12px;
    height: 56px;
  }

  .admin-main {
    padding: 12px !important;
    min-height: calc(100vh - 56px);
  }

  .logo {
    height: 56px;
  }

  /* 移动端表格横向滚动 */
  :deep(.el-table) {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  :deep(.el-table__body-wrapper) {
    overflow-x: auto !important;
  }
  :deep(.el-table__header-wrapper),
  :deep(.el-table__body-wrapper) {
    min-width: 600px;
  }

  /* 移动端表单 */
  :deep(.el-form--inline .el-form-item) {
    display: flex !important;
    flex-direction: column;
    margin-right: 0 !important;
    width: 100% !important;
  }
  :deep(.el-form--inline .el-form-item__label) {
    text-align: left !important;
    min-width: auto !important;
    padding-bottom: 4px !important;
  }
  :deep(.el-form--inline .el-form-item__content) {
    width: 100%;
  }
  :deep(.el-form--inline .el-form-item__content > *) {
    width: 100% !important;
  }
}
</style>

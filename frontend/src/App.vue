<template>
  <el-config-provider>
    <router-view v-slot="{ Component }">
      <component :is="Component" v-loading.fullscreen.lock="globalLoading" />
    </router-view>
  </el-config-provider>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const globalLoading = ref(false)

// 路由加载进度
router.beforeEach((to, from, next) => {
  globalLoading.value = true
  next()
})

router.afterEach(() => {
  setTimeout(() => {
    globalLoading.value = false
  }, 300)
})
</script>

<style>
/* 全局加载样式优化 */
.el-loading-mask {
  background-color: rgba(255, 255, 255, 0.9) !important;
}

.el-loading-spinner .circular {
  width: 42px !important;
  height: 42px !important;
}

.el-loading-spinner .path {
  stroke: #409eff !important;
  stroke-width: 3 !important;
}
</style>

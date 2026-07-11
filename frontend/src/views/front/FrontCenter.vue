<template>
  <div class="center-container">
    <el-card class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img
              v-if="form.avatar"
              :src="getImg(form.avatar)"
              class="avatar-image"
              alt="头像"
            />
            <div v-else class="avatar-placeholder">
              {{ form.name?.[0] || 'U' }}
            </div>
            <div class="avatar-overlay" @click="showUploadDialog = true">
              <el-icon><Camera /></el-icon>
              <span>更换头像</span>
            </div>
          </div>
          <div class="user-info">
            <h2 class="user-name">{{ form.name }}</h2>
            <p class="user-id">学号：{{ form.student_no }}</p>
          </div>
        </div>
        <div class="wallet-section">
          <div class="wallet-label">账户余额</div>
          <div class="wallet-amount">¥{{ Number(form.balance || 0).toFixed(2) }}</div>
          <el-button size="small" text @click="$router.push('/front/wallet')">
            充值 →
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 快捷功能卡片 -->
    <div class="quick-actions">
      <el-card 
        v-for="action in quickActions" 
        :key="action.path"
        class="action-card"
        shadow="hover"
        @click="$router.push(action.path)"
      >
        <div class="action-icon">
          <el-icon :size="32">
            <component :is="action.icon" />
          </el-icon>
        </div>
        <div class="action-title">{{ action.title }}</div>
        <div class="action-count" v-if="action.count !== undefined">{{ action.count }}</div>
      </el-card>
    </div>

    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
          <el-button type="primary" size="small" @click="save" :loading="saving">
            保存修改
          </el-button>
        </div>
      </template>

      <el-form :model="form" label-width="80px" class="info-form">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 头像上传对话框 -->
    <el-dialog 
      v-model="showUploadDialog" 
      title="更换头像" 
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="avatar-selection">
        <div class="avatars-grid">
          <!-- 上传头像按钮 -->
          <div class="avatar-item upload-item">
            <el-upload
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              accept="image/*"
            >
              <div class="upload-trigger">
                <el-icon :size="32"><Upload /></el-icon>
                <div class="upload-label">上传</div>
              </div>
            </el-upload>
          </div>

          <!-- 默认头像列表 -->
          <div 
            v-for="avatar in defaultAvatars" 
            :key="avatar.id"
            class="avatar-item"
            :class="{ selected: tempAvatar === avatar.storeKey }"
            @click="selectDefaultAvatar(avatar.storeKey)"
          >
            <img :src="avatar.displayUrl" :alt="avatar.name" />
            <div v-if="tempAvatar === avatar.storeKey" class="selected-badge">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>

        <!-- 预览区 -->
        <div v-if="tempAvatar" class="preview-section">
          <div class="preview-label">预览</div>
          <img :src="getImg(tempAvatar)" class="preview-image" />
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showUploadDialog = false; tempAvatar = ''">取消</el-button>
        <el-button 
          type="primary" 
          @click="saveAvatar" 
          :disabled="!tempAvatar"
          :loading="uploading"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Camera, Upload, Document, Star, Location, Wallet, Sell, Check } from '@element-plus/icons-vue'
import http from '@/utils/http'
import { resolveAvatarUrl, getDefaultAvatars } from '@/utils/avatar'
import authStorage from '@/utils/auth'

const router = useRouter()

const form = ref({
  student_no: '',
  name: '',
  gender: '男',
  phone: '',
  avatar: '',
  balance: 0,
})

const saving = ref(false)
const showUploadDialog = ref(false)
const tempAvatar = ref('')
const uploading = ref(false)

const orderCount = ref(0)
const favoriteCount = ref(0)
const addressCount = ref(0)
const myBooksCount = ref(0)

// 使用共享头像工具
const defaultAvatars = getDefaultAvatars()

const quickActions = computed(() => [
  { 
    title: '我的订单', 
    path: '/front/orders', 
    icon: markRaw(Document),
    count: orderCount.value 
  },
  { 
    title: '我的收藏', 
    path: '/front/storeup', 
    icon: markRaw(Star),
    count: favoriteCount.value 
  },
  { 
    title: '收货地址', 
    path: '/front/address', 
    icon: markRaw(Location),
    count: addressCount.value 
  },
  { 
    title: '我的钱包', 
    path: '/front/wallet', 
    icon: markRaw(Wallet),
    count: undefined 
  },
  { 
    title: '我卖的书', 
    path: '/front/my-books', 
    icon: markRaw(Sell),
    count: myBooksCount.value 
  },
])

const uploadUrl = '/api/file/upload'
const uploadHeaders = authStorage.authHeader()

const getImg = (v) => resolveAvatarUrl(v)

const loadUserInfo = async () => {
  const uid = authStorage.get('userid')
  const { data: res } = await http.get(`/yonghu/info/${uid}`)
  if (res.code === 0 && res.data) {
    form.value = {
      ...form.value,
      ...res.data,
    }
  }
  // 单独获取最新余额
  try {
    const balanceRes = await http.get('/wallet/balance')
    if (balanceRes.data?.code === 0) {
      form.value.balance = balanceRes.data.data.balance || 0
    }
  } catch (e) {
    console.error('获取余额失败', e)
  }
}

const loadStats = async () => {
  const uid = authStorage.get('userid')
  try {
    const [ordersRes, favRes, addrRes, booksRes] = await Promise.all([
      http.get('/order/page', { params: { page: 1, limit: 1, viewType: 'buy' } }),
      http.get('/favorite/list', { params: { page: 1, limit: 1, userid: uid } }),
      http.get('/address/list', { params: { page: 1, limit: 100 } }),
      http.get('/book/list', { params: { page: 1, limit: 1, seller_id: uid } }),
    ])
    orderCount.value = ordersRes.data?.data?.total || 0
    favoriteCount.value = favRes.data?.data?.total || 0
    addressCount.value = addrRes.data?.data?.list?.length || 0
    myBooksCount.value = booksRes.data?.data?.total || 0
  } catch (e) {
    console.error('加载统计数据失败', e)
  }
}

onMounted(() => {
  loadUserInfo()
  loadStats()
  
  // 监听余额更新事件
  window.addEventListener('balance-updated', loadUserInfo)
})

onUnmounted(() => {
  window.removeEventListener('balance-updated', loadUserInfo)
})

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

const handleUploadSuccess = (response) => {
  if (response.code === 0 && response.data?.file) {
    tempAvatar.value = response.data.file
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}

const selectDefaultAvatar = (avatarUrl) => {
  tempAvatar.value = avatarUrl
}

const saveAvatar = async () => {
  if (!tempAvatar.value) return
  
  uploading.value = true
  try {
    const { data: res } = await http.post('/yonghu/update', {
      id: form.value.id,
      student_no: form.value.student_no,
      name: form.value.name,
      avatar: tempAvatar.value
    })
    
    if (res.code === 0) {
      form.value.avatar = tempAvatar.value
      authStorage.set('avatar', tempAvatar.value)
      ElMessage.success('头像更新成功')
      showUploadDialog.value = false
      tempAvatar.value = ''
      
      // 触发全局头像更新事件
      window.dispatchEvent(new CustomEvent('avatar-updated', { 
        detail: { avatar: form.value.avatar } 
      }))
    } else {
      ElMessage.error(res.msg || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新失败')
  } finally {
    uploading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    const { data: res } = await http.post('/yonghu/update', {
      id: form.value.id,
      name: form.value.name,
      gender: form.value.gender,
      phone: form.value.phone,
    })
    if (res.code === 0) {
      authStorage.set('username', form.value.name)
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.center-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.profile-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.profile-card :deep(.el-card__body) {
  padding: 0;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.avatar-image,
.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background: #0a0a0a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 600;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
  font-size: 12px;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 24px;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #0a0a0a;
}

.user-id {
  margin: 0;
  font-size: 14px;
  color: #737373;
}

.wallet-section {
  text-align: right;
}

.wallet-label {
  font-size: 13px;
  color: #737373;
  margin-bottom: 8px;
}

.wallet-amount {
  font-size: 32px;
  font-weight: 600;
  color: #0a0a0a;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

/* 快捷功能卡片 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.action-card {
  cursor: pointer;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.action-card:hover {
  border-color: #2563eb;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
}

.action-card :deep(.el-card__body) {
  padding: 28px 20px;
}

.action-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
  color: #2563eb;
}

.action-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}

.action-count {
  font-size: 24px;
  font-weight: 700;
  color: #2563eb;
  letter-spacing: -0.01em;
}

.info-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.info-form {
  padding: 24px 0;
}

/* 头像选择 */
.avatar-selection {
  padding: 20px 0;
}

.avatars-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.avatar-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.avatar-item:hover {
  border-color: #2563eb;
  transform: scale(1.05);
}

.avatar-item.selected {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.avatar-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selected-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  border: 2px solid #fff;
}

/* 上传按钮 */
.avatar-item.upload-item {
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-item.upload-item:hover {
  background: #f1f5f9;
  border-color: #2563eb;
}

.avatar-item.upload-item :deep(.el-upload) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: color 0.2s;
}

.avatar-item.upload-item:hover .upload-trigger {
  color: #2563eb;
}

.upload-trigger .el-icon {
  margin-bottom: 4px;
}

.upload-label {
  font-size: 12px;
  font-weight: 500;
}

/* 预览区 */
.preview-section {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.preview-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 500;
}

.preview-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

/* 响应式 */
@media (max-width: 768px) {
  .center-container {
    padding: 16px;
  }

  .profile-header {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }

  .avatar-section {
    flex-direction: column;
  }

  .wallet-section {
    text-align: center;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

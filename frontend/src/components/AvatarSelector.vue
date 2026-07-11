<template>
  <div class="avatar-selector">
    <!-- 当前头像预览 -->
    <div class="current-avatar" @click="dialogVisible = true">
      <img v-if="modelValue" :src="getImg(modelValue)" class="avatar-preview" />
      <el-icon v-else class="avatar-placeholder"><Plus /></el-icon>
      <div class="avatar-overlay">
        <el-icon><Edit /></el-icon>
        <span>选择头像</span>
      </div>
    </div>

    <!-- 头像选择对话框 -->
    <el-dialog v-model="dialogVisible" title="选择头像" width="680px">
      <div class="avatar-selection">
        <div class="avatars-grid">
          <!-- 上传头像按钮 -->
          <div class="avatar-item upload-item">
            <el-upload
              :action="uploadUrl"
              :headers="headers"
              :show-file-list="false"
              :on-success="onUploadSuccess"
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
            @click="selectAvatar(avatar.storeKey)"
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
          <img :src="resolveAvatarUrl(tempAvatar)" class="preview-image" />
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection" :disabled="!tempAvatar">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus, Edit, Check, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { resolveAvatarUrl, getDefaultAvatars } from '@/utils/avatar'
import authStorage from '@/utils/auth'

const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])

const dialogVisible = ref(false)
const tempAvatar = ref('')

const uploadUrl = '/api/file/upload'
const headers = authStorage.authHeader()

const defaultAvatars = getDefaultAvatars()

const getImg = resolveAvatarUrl

const selectAvatar = (storeKey) => {
  tempAvatar.value = storeKey
}

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

const onUploadSuccess = (res) => {
  if (res.code === 0 && res.data?.file) {
    tempAvatar.value = res.data.file
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}

const confirmSelection = () => {
  if (tempAvatar.value) {
    emit('update:modelValue', tempAvatar.value)
    dialogVisible.value = false
  } else {
    ElMessage.warning('请选择一个头像')
  }
}

// 打开对话框时初始化
watch(dialogVisible, (val) => {
  if (val) {
    tempAvatar.value = props.modelValue || ''
  }
})
</script>

<style scoped>
.avatar-selector {
  display: inline-block;
}

.current-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border: 1px dashed #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #999;
  background: #fafafa;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
  gap: 4px;
}

.current-avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay span {
  font-size: 12px;
}

/* 头像选择区域 */
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
</style>

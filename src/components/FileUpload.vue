<template>
  <div>
    <el-upload
      :action="uploadUrl"
      :headers="headers"
      :show-file-list="false"
      :on-success="onSuccess"
      accept="image/*"
    >
      <img v-if="modelValue" :src="getImg(modelValue)" class="upload-preview" />
      <el-icon v-else class="upload-icon"><Plus /></el-icon>
    </el-upload>
  </div>
</template>

<script setup>
import authStorage from '@/utils/auth'

const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])
const uploadUrl = '/api/file/upload'
const headers = authStorage.authHeader()
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''
const onSuccess = (res) => {
  if (res.code === 0 && res.data?.file) {
    emit('update:modelValue', res.data.file)
  }
}
</script>

<style scoped>
.upload-preview { width: 120px; height: 120px; object-fit: cover; border-radius: 4px; cursor: pointer; }
.upload-icon { width: 120px; height: 120px; border: 1px dashed #d9d9d9; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #999; cursor: pointer; }
.upload-icon:hover { border-color: #409eff; color: #409eff; }
</style>

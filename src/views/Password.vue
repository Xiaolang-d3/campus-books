<template>
  <el-card>
    <template #header>修改密码</template>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" style="max-width:500px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="form.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="form.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'
import authStorage from '@/utils/auth'

const tableName = authStorage.get('tableName') || 'users'
const formRef = ref()
const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const userInfo = ref({})
const rules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }]
}

onMounted(async () => {
  const url = tableName === 'users' ? '/users/session' : `/${tableName}/session`
  const { data: res } = await http.get(url)
  if (res.code === 0) userInfo.value = res.data
})

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (form.newPassword !== form.confirmPassword) return ElMessage.error('两次密码不一致')
    const pwdField = tableName === 'users' ? 'password' : 'mima'
    if (userInfo.value[pwdField] !== form.oldPassword) return ElMessage.error('原密码不正确')
    userInfo.value[pwdField] = form.newPassword
    const url = tableName === 'users' ? '/users/update' : `/${tableName}/update`
    const { data: res } = await http.post(url, userInfo.value)
    res.code === 0 ? ElMessage.success('修改成功') : ElMessage.error(res.msg)
  })
}
</script>

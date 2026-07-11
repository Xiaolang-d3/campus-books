<template>
  <el-card>
    <template #header>个人信息</template>

    <el-form :model="form" label-width="100px" style="max-width: 560px">
      <template v-if="tableName === 'users'">
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-input v-model="form.role" disabled />
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item label="学号">
          <el-input v-model="form.yonghuzhanghao" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.yonghuxingming" />
        </el-form-item>
        <el-form-item label="学院">
          <el-input v-model="form.xueyuan" />
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="form.zhuanye" />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="form.nianji" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.xingbie">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.dianhuahaoma" />
        </el-form-item>
      </template>

      <el-form-item>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'
import authStorage from '@/utils/auth'

const tableName = authStorage.get('tableName') || 'users'
const form = ref({})

onMounted(async () => {
  const url = tableName === 'users' ? '/users/session' : '/yonghu/session'
  const { data: res } = await http.get(url)
  if (res.code === 0) {
    form.value = res.data
  }
})

const handleSave = async () => {
  if (tableName === 'yonghu') {
    const requiredFields = [
      ['yonghuxingming', '姓名'],
      ['xueyuan', '学院'],
      ['zhuanye', '专业'],
      ['nianji', '年级'],
    ]
    for (const [field, label] of requiredFields) {
      if (!form.value[field]) {
        ElMessage.error(`${label}不能为空`)
        return
      }
    }
  }

  const url = tableName === 'users' ? '/users/update' : '/yonghu/update'
  const { data: res } = await http.post(url, form.value)
  if (res.code === 0) {
    ElMessage.success('保存成功')
  } else {
    ElMessage.error(res.msg)
  }
}
</script>

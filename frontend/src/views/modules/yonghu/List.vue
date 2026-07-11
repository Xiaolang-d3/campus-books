<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="学号">
          <el-input v-model="searchForm.student_no" placeholder="请输入学号" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="学院">
          <el-select v-model="searchForm.college_id" placeholder="全部" clearable @change="handleCollegeChange">
            <el-option v-for="c in colleges" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="searchForm.major_id" placeholder="全部" clearable>
            <el-option v-for="m in majorOptions" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="searchForm.grade" placeholder="请输入年级" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="openDialog()">新增</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" @selection-change="handleSelectionChange" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="student_no" label="学号" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="college_name" label="学院" min-width="140" />
        <el-table-column prop="major_name" label="专业" min-width="140" />
        <el-table-column prop="grade" label="年级" min-width="110" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="phone" label="电话" min-width="140" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar v-if="row.avatar" :src="getImg(row.avatar)" :size="40" />
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="100">
          <template #default="{ row }">¥{{ row.balance }}</template>
        </el-table-column>
        <el-table-column prop="addtime" label="注册时间" width="180">
          <template #default="{ row }">
            {{ row.addtime ? new Date(row.addtime).toLocaleString('zh-CN') : '' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 16px; justify-content: flex-end"
        v-model:current-page="page"
        v-model:page-size="limit"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @change="loadData"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="560px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="学号">
          <el-input v-model="form.student_no" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password :placeholder="isEdit ? '不修改请留空' : ''" />
        </el-form-item>
        <el-form-item label="学院">
          <el-select v-model="form.college_id" placeholder="请选择学院" @change="handleFormCollegeChange">
            <el-option v-for="c in colleges" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="form.major_id" placeholder="请选择专业">
            <el-option v-for="m in formMajors" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="form.grade" placeholder="如 2022级" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="头像">
          <AvatarSelector v-model="form.avatar" />
        </el-form-item>
        <el-form-item label="余额">
          <el-input-number v-model="form.balance" :min="0" :precision="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'
import AvatarSelector from '@/components/AvatarSelector.vue'
import { resolveAvatarUrl } from '@/utils/avatar'

const colleges = ref([])
const majors = ref([])

const searchForm = reactive({
  student_no: '',
  name: '',
  college_id: '',
  major_id: '',
  grade: '',
})
const majorOptions = computed(() => {
  if (!searchForm.college_id) return majors.value
  return majors.value.filter(m => m.college_id === searchForm.college_id)
})

const tableData = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({})
const selectedIds = ref([])

const formMajors = computed(() => {
  if (!form.value.college_id) return majors.value
  return majors.value.filter(m => m.college_id === form.value.college_id)
})

const getImg = (v) => resolveAvatarUrl(v)

const loadColleges = async () => {
  try {
    const { data: res } = await http.get('/college/list')
    if (res.code === 0) {
      colleges.value = res.data || []
    }
  } catch { colleges.value = [] }
}

const loadMajors = async () => {
  try {
    const { data: res } = await http.get('/major/list')
    if (res.code === 0) {
      majors.value = res.data || []
    }
  } catch { majors.value = [] }
}

const loadData = async () => {
  const { data: res } = await http.get('/yonghu/page', {
    params: { ...searchForm, page: page.value, limit: limit.value },
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const resetSearch = () => {
  Object.assign(searchForm, {
    student_no: '',
    name: '',
    college_id: '',
    major_id: '',
    grade: '',
  })
  loadData()
}

const handleCollegeChange = () => {
  searchForm.major_id = ''
}

const handleFormCollegeChange = () => {
  form.value.major_id = ''
}

const openDialog = (row) => {
  isEdit.value = !!row
  form.value = row
    ? { ...row, password: '' }
    : {
        student_no: '',
        name: '',
        password: '123456',
        gender: '男',
        phone: '',
        avatar: '',
        college_id: '',
        major_id: '',
        grade: '',
        balance: 0,
      }
  dialogVisible.value = true
}

const validateForm = () => {
  if (!form.value.student_no || !form.value.name) {
    ElMessage.error('请完整填写学号和姓名')
    return false
  }
  if (!isEdit.value && !form.value.password) {
    ElMessage.error('请填写密码')
    return false
  }
  return true
}

const handleSave = async () => {
  if (!validateForm()) return
  const payload = { ...form.value }
  if (!payload.password) delete payload.password
  const url = isEdit.value ? '/yonghu/update' : '/yonghu/save'
  const { data: res } = await http.post(url, payload)
  if (res.code === 0) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该用户吗？', '提示')
  const { data: res } = await http.post('/yonghu/delete', [id])
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(row => row.id)
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条数据吗？`, '提示')
  const { data: res } = await http.post('/yonghu/delete', selectedIds.value)
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

onMounted(async () => {
  await Promise.all([loadColleges(), loadMajors()])
  loadData()
})
</script>

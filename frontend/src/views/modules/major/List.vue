<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="专业名称">
          <el-input v-model="searchForm.name" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="所属学院">
          <el-select v-model="searchForm.college_id" placeholder="请选择" clearable>
            <el-option v-for="c in colleges" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="searchForm.name = ''; searchForm.college_id = ''; loadData()">重置</el-button>
          <el-button type="success" @click="openDialog()">新增</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" @selection-change="sel => selectedIds = sel.map(r=>r.id)" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="专业名称" />
        <el-table-column prop="college_id" label="所属学院" width="150">
          <template #default="{ row }">
            {{ colleges.find(c => c.id === row.college_id)?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="year" label="学制(年)" width="100" />
        <el-table-column prop="addtime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination style="margin-top:16px;justify-content:flex-end" v-model:current-page="page"
        v-model:page-size="limit" :total="total" :page-sizes="[10,20,50]"
        layout="total, sizes, prev, pager, next" @change="loadData" />
    </el-card>
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑专业' : '新增专业'" width="500px">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="专业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入专业名称" />
        </el-form-item>
        <el-form-item label="所属学院" prop="college_id">
          <el-select v-model="form.college_id" placeholder="请选择学院" style="width:100%">
            <el-option v-for="c in colleges" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="学制(年)">
          <el-input-number v-model="form.year" :min="1" :max="8" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'

const searchForm = reactive({ name: '', college_id: '' })
const tableData = ref([])
const colleges = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const form = ref({})
const selectedIds = ref([])
const formRef = ref(null)

const rules = {
  name: [{ required: true, message: '请输入专业名称', trigger: 'blur' }],
  college_id: [{ required: true, message: '请选择所属学院', trigger: 'change' }]
}

const loadColleges = async () => {
  const { data: res } = await http.get('/college/list')
  if (res.code === 0) colleges.value = res.data
}

const loadData = async () => {
  const { data: res } = await http.get('/major/list', { params: { ...searchForm, page: page.value, limit: limit.value } })
  if (res.code === 0) {
    tableData.value = res.data
    total.value = res.data.length
  }
}

const openDialog = (row) => {
  form.value = row ? { ...row } : { name: '', college_id: '', year: 4 }
  dialogVisible.value = true
}

const handleSave = async () => {
  await formRef.value.validate()
  const url = form.value.id ? '/major/update' : '/major/save'
  const { data: res } = await http.post(url, form.value)
  if (res.code === 0) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该专业？', '提示', { type: 'warning' })
  const { data: res } = await http.post('/major/delete', [id])
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return ElMessage.warning('请选择要删除的数据')
  await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length}条数据？`, '提示', { type: 'warning' })
  const { data: res } = await http.post('/major/delete', selectedIds.value)
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

onMounted(() => {
  loadColleges()
  loadData()
})
</script>

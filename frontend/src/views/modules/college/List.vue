<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="学院名称">
          <el-input v-model="searchForm.name" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="searchForm.name = ''; loadData()">重置</el-button>
          <el-button type="success" @click="openDialog()">新增</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" @selection-change="sel => selectedIds = sel.map(r=>r.id)" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="学院名称" />
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
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑学院' : '新增学院'" width="500px">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="学院名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入学院名称" />
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

const searchForm = reactive({ name: '' })
const tableData = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const form = ref({})
const selectedIds = ref([])
const formRef = ref(null)

const rules = {
  name: [{ required: true, message: '请输入学院名称', trigger: 'blur' }]
}

const loadData = async () => {
  const { data: res } = await http.get('/college/list', { params: { ...searchForm, page: page.value, limit: limit.value } })
  if (res.code === 0) {
    tableData.value = res.data
    total.value = res.data.length
  }
}

const openDialog = (row) => {
  form.value = row ? { ...row } : { name: '' }
  dialogVisible.value = true
}

const handleSave = async () => {
  await formRef.value.validate()
  const url = form.value.id ? '/college/update' : '/college/save'
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
  await ElMessageBox.confirm('确定删除该学院？', '提示', { type: 'warning' })
  const { data: res } = await http.post('/college/delete', [id])
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return ElMessage.warning('请选择要删除的数据')
  await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length}条数据？`, '提示', { type: 'warning' })
  const { data: res } = await http.post('/college/delete', selectedIds.value)
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

onMounted(loadData)
</script>

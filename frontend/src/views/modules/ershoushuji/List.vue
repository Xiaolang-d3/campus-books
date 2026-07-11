<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="书籍名称">
          <el-input v-model="searchForm.title" placeholder="请输入书籍名称" clearable />
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="searchForm.isbn" placeholder="请输入 ISBN" clearable />
        </el-form-item>
        <el-form-item label="书籍分类">
          <el-select v-model="searchForm.category_id" placeholder="全部" clearable>
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="新旧程度">
          <el-select v-model="searchForm.condition_id" placeholder="全部" clearable>
            <el-option v-for="c in conditions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="下架" :value="0" />
            <el-option label="上架" :value="1" />
            <el-option label="已售出" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="卖家">
          <el-input v-model="searchForm.seller_name" placeholder="请输入卖家姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="openDialog()">新增</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="isbn" label="ISBN" min-width="140" />
        <el-table-column prop="title" label="书籍名称" min-width="180" />
        <el-table-column prop="author" label="作者" min-width="120" />
        <el-table-column prop="publisher" label="出版社" min-width="140" />
        <el-table-column label="封面" width="92">
          <template #default="{ row }">
            <el-image
              v-if="row.cover"
              :src="getImg(row.cover)"
              style="width: 60px; height: 60px"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="category_name" label="分类" min-width="100" />
        <el-table-column prop="condition_name" label="新旧程度" min-width="100" />
        <el-table-column prop="seller_name" label="卖家" min-width="100" />
        <el-table-column prop="price" label="售价" width="90">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="original_price" label="原价" width="90">
          <template #default="{ row }">¥{{ row.original_price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">上架</el-tag>
            <el-tag v-else-if="row.status === 0" type="info">下架</el-tag>
            <el-tag v-else type="warning">已售出</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="addtime" label="添加时间" width="180">
          <template #default="{ row }">
            {{ row.addtime ? new Date(row.addtime).toLocaleString('zh-CN') : '' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="toggleStatus(row)">
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑书籍' : '新增书籍'" width="760px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="书籍名称" required>
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="form.isbn" />
        </el-form-item>
        <el-form-item label="封面">
          <FileUpload v-model="form.cover" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.author" />
        </el-form-item>
        <el-form-item label="出版社">
          <el-input v-model="form.publisher" />
        </el-form-item>
        <el-form-item label="书籍分类">
          <el-select v-model="form.category_id" placeholder="请选择">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="新旧程度">
          <el-select v-model="form.condition_id" placeholder="请选择">
            <el-option v-for="c in conditions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="售价" required>
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number v-model="form.original_price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" :step="1" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="书籍简介">
          <el-input v-model="form.description" type="textarea" :rows="4" />
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
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import http from '@/utils/http'

const categories = ref([])
const conditions = ref([])

const searchForm = reactive({
  title: '',
  isbn: '',
  category_id: '',
  condition_id: '',
  status: '',
  seller_name: '',
})

const tableData = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const selectedIds = ref([])
const form = ref({})

const getImg = (value) => (value ? (value.startsWith('http') ? value : `/api/file/download/${value}`) : '')

const createDefaultForm = () => ({
  isbn: '',
  title: '',
  author: '',
  cover: '',
  publisher: '',
  description: '',
  category_id: '',
  condition_id: '',
  price: 0,
  original_price: 0,
  stock: 1,
  status: 1,
})

const loadCategories = async () => {
  try {
    const { data: res } = await http.get('/bookCategory/option')
    if (res.code === 0) categories.value = res.data || []
  } catch { categories.value = [] }
}

const loadConditions = async () => {
  try {
    const { data: res } = await http.get('/conditionLevel/option')
    if (res.code === 0) conditions.value = res.data || []
  } catch { conditions.value = [] }
}

const loadData = async () => {
  const { data: res } = await http.get('/book/page', {
    params: { ...searchForm, page: page.value, limit: limit.value },
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const resetSearch = () => {
  Object.assign(searchForm, {
    title: '',
    isbn: '',
    category_id: '',
    condition_id: '',
    status: '',
    seller_name: '',
  })
  loadData()
}

const openDialog = (row) => {
  isEdit.value = !!row
  form.value = row ? { ...row } : createDefaultForm()
  dialogVisible.value = true
}

const validateForm = () => {
  if (!form.value.title) {
    ElMessage.error('书籍名称不能为空')
    return false
  }
  if (form.value.price === undefined || form.value.price === null) {
    ElMessage.error('售价不能为空')
    return false
  }
  return true
}

const handleSave = async () => {
  if (!validateForm()) return
  const url = isEdit.value ? '/book/update' : '/book/save'
  const { data: res } = await http.post(url, form.value)
  if (res.code === 0) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const { data: res } = await http.post('/book/update', { id: row.id, status: newStatus })
  if (res.code === 0) {
    ElMessage.success(newStatus === 1 ? '上架成功' : '下架成功')
    loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除这本书吗？', '提示')
  const { data: res } = await http.post('/book/delete', [id])
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map((row) => row.id)
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择数据')
    return
  }
  await ElMessageBox.confirm(`确定删除 ${selectedIds.value.length} 本书吗？`, '提示')
  const { data: res } = await http.post('/book/delete', selectedIds.value)
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadConditions()])
  loadData()
})
</script>

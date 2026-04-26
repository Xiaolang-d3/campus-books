<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-size: 18px; font-weight: 700">我的发布</span>
          <el-button type="primary" @click="openDialog()">发布书籍</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm">
        <el-form-item label="书名">
          <el-input v-model="searchForm.title" placeholder="请输入书名" clearable />
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="searchForm.isbn" placeholder="请输入ISBN" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" border>
        <el-table-column prop="title" label="书籍名称" min-width="180" />
        <el-table-column prop="isbn" label="ISBN" min-width="140" />
        <el-table-column label="作者" min-width="120">
          <template #default="{ row }">{{ row.author || '-' }}</template>
        </el-table-column>
        <el-table-column prop="category_name" label="分类" width="100" />
        <el-table-column prop="condition_name" label="新旧程度" width="100" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">￥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-tooltip v-if="row.has_orders" content="该书籍存在关联订单，无法删除" placement="top">
              <el-button size="small" type="danger" disabled>删除</el-button>
            </el-tooltip>
            <el-button v-else size="small" type="danger" @click="removeBook(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        style="margin-top: 16px; justify-content: center"
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="10"
        v-model:current-page="page"
        @current-change="loadData"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑书籍' : '发布书籍'" width="760px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="书名"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="封面"><FileUpload v-model="form.cover" /></el-form-item>
        <el-form-item label="作者"><el-input v-model="form.author" /></el-form-item>
        <el-form-item label="ISBN"><el-input v-model="form.isbn" /></el-form-item>
        <el-form-item label="出版社"><el-input v-model="form.publisher" /></el-form-item>
        <el-form-item label="书籍分类">
          <el-select v-model="form.category_id" placeholder="请选择书籍分类">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="新旧程度">
          <el-select v-model="form.condition_id" placeholder="请选择书籍成色">
            <el-option v-for="c in conditions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格"><el-input-number v-model="form.price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="原价"><el-input-number v-model="form.original_price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" :step="1" /></el-form-item>
        <el-form-item label="简介"><el-input v-model="form.description" type="textarea" :rows="4" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBook">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import http from '@/utils/http'
import authStorage from '@/utils/auth'

const categories = ref([])
const conditions = ref([])

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

const searchForm = reactive({ title: '', isbn: '' })
const list = ref([])
const page = ref(1)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({})

const buildDefaultForm = () => ({
  title: '',
  cover: '',
  author: '',
  isbn: '',
  publisher: '',
  category_id: '',
  condition_id: '',
  price: 0,
  original_price: 0,
  stock: 1,
  description: '',
})

const loadData = async () => {
  try {
    const uid = authStorage.get('userid')
    const { data: res } = await http.get('/book/list', {
      params: { ...searchForm, seller_id: uid, page: page.value, limit: 10 },
    })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error('Error loading books:', error)
    ElMessage.error('加载数据失败')
  }
}

const resetSearch = () => {
  searchForm.title = ''
  searchForm.isbn = ''
  loadData()
}

const openDialog = (row) => {
  isEdit.value = !!row
  if (row) {
    // 编辑时只取模型需要的字段，避免传冗余字段给后端
    form.value = {
      id: row.id,
      title: row.title,
      cover: row.cover,
      author: row.author,
      isbn: row.isbn,
      publisher: row.publisher,
      category_id: row.category_id,
      condition_id: row.condition_id,
      price: row.price,
      original_price: row.original_price,
      stock: row.stock,
      description: row.description,
    }
  } else {
    form.value = buildDefaultForm()
  }
  dialogVisible.value = true
}

const validateForm = () => {
  if (!form.value.title) {
    ElMessage.error('书名不能为空')
    return false
  }
  if (!form.value.isbn) {
    ElMessage.error('ISBN不能为空')
    return false
  }
  return true
}

const saveBook = async () => {
  if (!validateForm()) return
  const url = isEdit.value ? '/book/update' : '/book/save'
  const { data: res } = await http.post(url, form.value)
  if (res.code === 0) {
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const removeBook = async (row) => {
  await ElMessageBox.confirm('确定删除这本书吗？', '提示')
  const { data: res } = await http.post('/book/delete', [row.id])
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  } else {
    ElMessage.error(res.msg || '删除失败')
  }
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadConditions()])
  loadData()
})
</script>

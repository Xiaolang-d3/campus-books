<template>
  <div class="publish-book-page">
    <el-card class="publish-card">
      <template #header>
        <div class="card-header">
          <h2>发布闲置书籍</h2>
          <p class="subtitle">让你的闲置书籍找到新主人</p>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="publish-form">
        <el-form-item label="书籍名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入书籍名称" />
        </el-form-item>

        <el-form-item label="书籍封面" prop="cover">
          <FileUpload v-model="form.cover" />
          <div class="form-tip">建议上传清晰的书籍封面图片</div>
        </el-form-item>

        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者姓名" />
        </el-form-item>

        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="form.isbn" placeholder="请输入ISBN编号" />
          <div class="form-tip">ISBN通常在书籍背面条形码下方</div>
        </el-form-item>

        <el-form-item label="出版社">
          <el-input v-model="form.publisher" placeholder="请输入出版社名称" />
        </el-form-item>

        <el-form-item label="书籍分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择书籍分类">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="新旧程度" prop="condition_id">
          <el-select v-model="form.condition_id" placeholder="请选择书籍成色">
            <el-option v-for="c in conditions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="售价" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" />
          <span class="unit">元</span>
        </el-form-item>

        <el-form-item label="原价">
          <el-input-number v-model="form.original_price" :min="0" :precision="2" :step="1" />
          <span class="unit">元</span>
          <div class="form-tip">填写书籍原价，方便买家参考</div>
        </el-form-item>

        <el-form-item label="库存数量" prop="stock">
          <el-input-number v-model="form.stock" :min="1" :step="1" />
          <span class="unit">本</span>
        </el-form-item>

        <el-form-item label="书籍简介">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="5" 
            placeholder="请描述书籍的内容、适用人群、使用情况等"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" @click="submitForm" :loading="submitting">
            发布书籍
          </el-button>
          <el-button size="large" @click="resetForm">重置</el-button>
          <el-button size="large" @click="$router.push('/front/my-books')">查看我的发布</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import http from '@/utils/http'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
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

const form = reactive({
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

const rules = {
  title: [{ required: true, message: '请输入书籍名称', trigger: 'blur' }],
  isbn: [{ required: true, message: '请输入ISBN编号', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者姓名', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择书籍分类', trigger: 'change' }],
  condition_id: [{ required: true, message: '请选择新旧程度', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const { data: res } = await http.post('/book/save', form)
      if (res.code === 0) {
        ElMessage.success('发布成功！')
        // 跳转到我的发布页面
        setTimeout(() => {
          router.push('/front/my-books')
        }, 1000)
      } else {
        ElMessage.error(res.msg || '发布失败')
      }
    } catch (error) {
      ElMessage.error('发布失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadConditions()])
})
</script>

<style scoped>
.publish-book-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.publish-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.publish-form {
  margin-top: 24px;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.unit {
  margin-left: 8px;
  color: #606266;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 200px;
}

:deep(.el-button) {
  min-width: 120px;
}

@media (max-width: 768px) {
  .publish-book-page {
    padding: 16px;
  }
  
  .card-header h2 {
    font-size: 20px;
  }
  
  :deep(.el-form-item__label) {
    width: 80px !important;
  }
}
</style>

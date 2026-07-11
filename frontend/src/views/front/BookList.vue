<template>
  <div class="book-list-container">
    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="书名">
          <el-input
            v-model="search.title"
            placeholder="搜索书名、作者"
            clearable
            @clear="loadData"
            @keyup.enter="loadData"
            style="width: 220px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input
            v-model="search.isbn"
            placeholder="搜索 ISBN"
            clearable
            @clear="loadData"
            @keyup.enter="loadData"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="search.category_id" placeholder="全部分类" clearable @change="loadData" style="width: 150px">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="新旧程度">
          <el-select v-model="search.condition_id" placeholder="全部成色" clearable @change="loadData" style="width: 150px">
            <el-option v-for="c in conditions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="sortType" @change="loadData" style="width: 150px">
            <el-option label="最新上架" value="addtime" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData" :loading="loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="result-info" v-if="!loading">
      共找到 <strong>{{ total }}</strong> 本专业书籍
    </div>

    <el-skeleton :loading="loading" animated :count="8">
      <template #template>
        <el-row :gutter="16" style="margin-top: 16px">
          <el-col :xs="12" :sm="8" :md="6" v-for="item in 8" :key="item">
            <el-card class="book-card-skeleton">
              <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
              <div style="padding: 12px 0">
                <el-skeleton-item variant="text" style="width: 80%" />
                <el-skeleton-item variant="text" style="width: 50%; margin-top: 8px" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <template #default>
        <el-empty v-if="!list.length" description="暂无书籍数据" />
        <el-row v-else :gutter="16" style="margin-top: 16px">
          <el-col :xs="12" :sm="8" :md="6" v-for="book in list" :key="book.id">
            <el-card class="book-card" shadow="hover" @click="$router.push(`/front/book/${book.id}`)">
              <div class="book-img-wrapper">
                <img :src="getImg(book.cover)" class="book-img" loading="lazy" />
                <div class="book-overlay" v-if="!book.stock || book.stock <= 0">已售罄</div>
              </div>
              <div class="book-info">
                <div class="book-name" :title="book.title">{{ book.title }}</div>
                <div class="book-author">{{ book.author || '-' }}</div>
                <div class="book-price">￥{{ book.price }}</div>
                <div class="book-meta">
                  <el-tag size="small" effect="plain">{{ book.category_name || '-' }}</el-tag>
                  <span class="condition">{{ book.condition_name || '-' }}</span>
                </div>
                <div class="book-stock">
                  <span v-if="book.stock > 10" class="stock-good">
                    <el-icon><CircleCheck /></el-icon> 库存充足
                  </span>
                  <span v-else-if="book.stock > 0" class="stock-low">
                    <el-icon><Warning /></el-icon> 仅剩 {{ book.stock }} 件
                  </span>
                  <span v-else class="stock-out">
                    <el-icon><CircleClose /></el-icon> 已售罄
                  </span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </el-skeleton>

    <el-pagination
      v-if="total > 0 && !loading"
      style="margin-top: 24px; justify-content: center"
      background
      layout="total, prev, pager, next, jumper"
      :total="total"
      :page-size="pageSize"
      v-model:current-page="page"
      @current-change="loadData"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { CircleCheck, CircleClose, Search, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const route = useRoute()

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 12
const sortType = ref('addtime')
const categories = ref([])
const conditions = ref([])
const search = ref({
  title: '',
  isbn: '',
  category_id: '',
  condition_id: '',
})

const getImg = (value) => (value ? (value.startsWith('http') ? value : `/api/file/download/${value}`) : '')

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      limit: pageSize,
      ...search.value,
    }

    if (sortType.value === 'price_asc') {
      params.sort = 'price'
      params.order = 'asc'
    } else if (sortType.value === 'price_desc') {
      params.sort = 'price'
      params.order = 'desc'
    } else {
      params.sort = 'addtime'
      params.order = 'desc'
    }

    const res = await http.get('/book/list', { params })
    list.value = res.data?.data?.list || []
    total.value = res.data?.data?.total || 0
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const q = route.query
  if (q.category_id != null && q.category_id !== '') {
    const id = Number(q.category_id)
    search.value.category_id = Number.isFinite(id) ? id : ''
  }
  if (q.keyword != null && String(q.keyword).trim() !== '') {
    search.value.title = String(q.keyword).trim()
  }
  await loadData()
  try {
    const [catRes, condRes] = await Promise.all([
      http.get('/bookCategory/list', { params: { page: 1, limit: 100 } }),
      http.get('/option/condition_level/name'),
    ])
    categories.value = catRes.data?.data?.list || []
    conditions.value = (condRes.data?.data || []).map((name, i) => ({ id: i + 1, name }))
  } catch {
    categories.value = []
    conditions.value = []
  }
})
</script>

<style scoped>
.book-list-container {
  min-height: calc(100vh - 200px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.filter-card {
  margin-bottom: 32px;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
  box-shadow: none;
}

.filter-card :deep(.el-card__body) {
  padding: 24px;
}

.filter-card :deep(.el-form-item__label) {
  color: #737373;
  font-size: 13px;
  font-weight: 500;
}

.filter-card :deep(.el-input__wrapper) {
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid transparent;
  box-shadow: none;
}

.filter-card :deep(.el-input__wrapper:hover) {
  background: #fff;
  border-color: #e5e5e5;
}

.filter-card :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: #0a0a0a;
}

.filter-card :deep(.el-button--primary) {
  background: #0a0a0a;
  border-color: #0a0a0a;
}

.filter-card :deep(.el-button--primary:hover) {
  background: #2a2a2a;
  border-color: #2a2a2a;
}

.result-info {
  padding: 16px 0;
  color: #737373;
  font-size: 14px;
  letter-spacing: 0.01em;
}

.result-info strong {
  color: #0a0a0a;
  font-size: 18px;
  font-weight: 600;
}

.book-card-skeleton {
  margin-bottom: 24px;
}

.book-card {
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.book-card:hover {
  transform: translateY(-8px);
  border-color: #0a0a0a;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.book-img-wrapper {
  position: relative;
  overflow: hidden;
  background: #fafafa;
}

.book-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-card:hover .book-img {
  transform: scale(1.08);
}

.book-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.05em;
}

.book-info {
  padding: 16px;
}

.book-name {
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #0a0a0a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.book-author {
  color: #737373;
  font-size: 13px;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-path {
  min-height: 38px;
  margin-bottom: 10px;
  color: #737373;
  font-size: 12px;
  line-height: 1.5;
}

.book-extra {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  color: #a3a3a3;
  font-size: 11px;
}

.book-price {
  color: #0a0a0a;
  font-size: 20px;
  font-weight: 600;
  margin: 10px 0;
  letter-spacing: -0.01em;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.book-meta :deep(.el-tag) {
  background: #fafafa;
  border-color: #e5e5e5;
  color: #737373;
  border-radius: 2px;
  font-size: 11px;
}

.condition {
  color: #a3a3a3;
  font-size: 12px;
}

.book-stock {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.stock-good {
  color: #059669;
}

.stock-low {
  color: #f59e0b;
}

.stock-out {
  color: #dc2626;
}

:deep(.el-pagination) {
  justify-content: center;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background: #0a0a0a;
}

:deep(.el-pagination.is-background .el-pager li:hover) {
  color: #0a0a0a;
}

@media (max-width: 768px) {
  .book-list-container {
    padding: 20px 16px;
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .book-img {
    height: 200px;
  }
}
</style>

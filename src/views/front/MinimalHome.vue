<template>
  <div class="minimal-home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">校园二手专业书籍交易平台</h1>
        <p class="hero-subtitle">让知识在校园流动，让学习更加经济</p>
        
        <!-- 搜索框 -->
        <div class="hero-search">
          <input 
            v-model="searchQuery" 
            class="search-input" 
            placeholder="搜索书名、作者、ISBN..." 
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            搜索
          </button>
        </div>
      </div>
    </section>

    <!-- AI 推荐横幅 -->
    <RecommendBanner :recommendations="recommendations" />

    <!-- Stats Section -->
    <section class="stats">
      <div class="stat-item" v-for="(stat, index) in stats" :key="index">
        <div class="stat-number">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </section>

    <!-- 快捷分类卡片 -->
    <section class="quick-categories" v-if="categories.length">
      <div class="section-header">
        <h2 class="section-title">热门分类</h2>
        <p class="section-subtitle">快速找到你需要的专业书籍</p>
      </div>
      <div class="quick-categories-grid">
        <div 
          v-for="category in categories.slice(0, 8)" 
          :key="category.id"
          class="quick-category-card"
          @click="searchByCategory(category)"
        >
          <div class="quick-category-icon">
            <el-icon :size="32">
              <component :is="getCategoryIcon(category.name)" />
            </el-icon>
          </div>
          <div class="quick-category-name">{{ category.name }}</div>
        </div>
      </div>
    </section>

    <!-- Books Section -->
        <section class="books-section">
      <div class="section-header">
        <h2 class="section-title">最新上架</h2>
            <router-link to="/front/books" class="view-all">
              查看全部
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </router-link>
          </div>

          <div v-if="loading" class="books-grid">
            <div v-for="i in 8" :key="i" class="book-skeleton">
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-text shorter"></div>
              </div>
            </div>
          </div>

          <div v-else-if="books.length" class="books-grid">
            <div 
              v-for="book in books" 
              :key="book.id" 
              class="book-card"
              @click="$router.push(`/front/book/${book.id}`)"
            >
              <div class="book-image">
                <img :src="getImg(book.cover)" :alt="book.title" loading="lazy" />
                <div v-if="!book.stock" class="sold-badge">售罄</div>
                <div v-else-if="book.stock <= 3" class="limited-badge">仅剩{{ book.stock }}件</div>
              </div>
              <div class="book-info">
                <h3 class="book-title">{{ book.title }}</h3>
                <p class="book-author">{{ book.author }}</p>
                <div class="book-footer">
                  <span class="book-price">¥{{ book.price }}</span>
                  <span class="book-condition">{{ book.condition_name }}</span>
                </div>
              </div>
            </div>
          </div>

          <el-empty v-else description="暂无书籍" />
    </section>

    <!-- Features Section：Element Plus 风格 -->
    <section class="features-section">
      <el-row :gutter="20" class="features-row">
        <el-col
          v-for="feature in features"
          :key="feature.title"
          :xs="24"
          :sm="12"
          :md="6"
        >
          <el-card shadow="never" class="feature-card">
            <div class="feature-icon-wrap">
              <el-icon class="feature-icon-el" :size="28">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <div class="feature-title">{{ feature.title }}</div>
            <p class="feature-desc">{{ feature.desc }}</p>
          </el-card>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import {
  Aim, Money, Lock, Lightning,
  Monitor, Reading, Briefcase, Histogram, Compass, Filter,
  Timer, Notebook, School, Brush, Collection
} from '@element-plus/icons-vue'
import http from '@/utils/http'
import RecommendBanner from '@/components/front/RecommendBanner.vue'

const router = useRouter()
const loading = ref(true)
const books = ref([])
const total = ref(0)
const categories = ref([])
const searchQuery = ref('')
const recommendations = ref([])

const quickTags = ['计算机', '文学', '经济', '数学', '物理']

const stats = computed(() => [
  { value: total.value, label: '在售书籍' },
  { value: categories.value.length, label: '书籍分类' },
  { value: '4', label: '学院覆盖' }
])

const features = [
  { icon: markRaw(Aim), title: '精准匹配', desc: '根据专业课程智能推荐' },
  { icon: markRaw(Money), title: '价格实惠', desc: '比新书便宜50%以上' },
  { icon: markRaw(Lock), title: '交易安全', desc: '平台担保，放心购买' },
  { icon: markRaw(Lightning), title: '快速交易', desc: '校内交易，当面验货' }
]

const getImg = (value) => {
  if (!value) return ''
  if (value.startsWith('data:image')) return value
  if (/^https?:\/\//i.test(value)) {
    return `/api/file/image-proxy?url=${encodeURIComponent(value)}`
  }
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '')
  if (normalized.startsWith('upload/')) {
    return `/api/file/download/${normalized}`
  }
  return `/api/file/download/upload/${normalized}`
}

/** 分类名 → Element Plus 线性图标（与数据库分类名对应） */
const categoryIconMap = {
  计算机: markRaw(Monitor),
  文学: markRaw(Reading),
  经济: markRaw(Briefcase),
  数学: markRaw(Histogram),
  物理: markRaw(Compass),
  化学: markRaw(Filter),
  历史: markRaw(Timer),
  艺术: markRaw(Brush),
  哲学: markRaw(Notebook),
  教育: markRaw(School)
}

const defaultCategoryIcon = markRaw(Collection)

const getCategoryIcon = (category) =>
  categoryIconMap[category] || defaultCategoryIcon

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/front/books', query: { keyword: searchQuery.value } })
  }
}

const quickSearch = (tag) => {
  router.push({ path: '/front/books', query: { keyword: tag } })
}

/** 分类接口返回对象 { id, name, ... }，列表页用 category_id 筛选 */
const searchByCategory = (category) => {
  if (!category?.id) return
  router.push({ path: '/front/books', query: { category_id: String(category.id) } })
}

const loadRecommendations = async () => {
  try {
    const recommendRes = await http.get('/recommend/home')
    recommendations.value = recommendRes.data?.data?.recommendations || []
  } catch (e) {
    console.error('首页推荐加载失败', e)
  }
}

onMounted(async () => {
  loading.value = true
  const recommendPromise = loadRecommendations()

  try {
    const [booksRes, categoriesRes] = await Promise.all([
      http.get('/book/list', { params: { page: 1, limit: 8, sort: 'addtime', order: 'desc' } }),
      http.get('/bookCategory/option')
    ])
    books.value = booksRes.data?.data?.list || []
    total.value = booksRes.data?.data?.total || 0
    categories.value = categoriesRes.data?.data || []
  } catch (e) {
    console.error('首页基础数据加载失败', e)
  } finally {
    loading.value = false
  }

  await recommendPromise
})
</script>

<style scoped>
/* —— 设计变量：与登录页保持一致 —— */
.minimal-home {
  --home-accent: #2563eb;
  --home-accent-hover: #1d4ed8;
  --home-ink: #0f172a;
  --home-muted: #64748b;
  --home-line: #e2e8f0;
  --home-bg: #f8fafc;

  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

/* 快捷分类卡片 */
.quick-categories {
  margin-bottom: 32px;
}

.quick-categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.quick-category-card {
  background: linear-gradient(135deg, #fff 0%, var(--home-bg) 100%);
  border: 1px solid var(--home-line);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.quick-category-card:hover {
  border-color: var(--home-accent);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
}

.quick-category-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
  color: var(--home-accent);
}

.quick-category-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--home-ink);
}

/* Hero Section */
.hero {
  padding: 60px 0 50px;
  text-align: center;
  background: linear-gradient(180deg, #ffffff 0%, var(--home-bg) 100%);
  margin: -32px -24px 0;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.04) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--home-ink);
  margin: 0 0 10px;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 15px;
  color: var(--home-muted);
  margin: 0 0 28px;
  font-weight: 500;
}

/* 搜索框 */
.hero-search {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  height: 52px;
  padding: 0 20px;
  border: 2px solid var(--home-line);
  border-radius: 26px;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;
  color: var(--home-ink);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.search-input:focus {
  outline: none;
  border-color: var(--home-accent);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1), 0 4px 12px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.search-input::placeholder {
  color: var(--home-muted);
}

.search-btn {
  height: 52px;
  padding: 0 28px;
  background: var(--home-accent);
  color: #fff;
  border: none;
  border-radius: 26px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  white-space: nowrap;
}

.search-btn:hover {
  background: var(--home-accent-hover);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
  transform: translateY(-2px);
}

.search-btn:active {
  transform: translateY(0);
}

/* Stats Section */
.stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  padding: 32px 0;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--home-line);
  margin-bottom: 32px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.stat-item {
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: var(--home-accent);
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: var(--home-muted);
  font-weight: 600;
  letter-spacing: 0.05em;
}

/* Categories Section */
.categories-section {
  padding: 50px 0 40px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
}

.category-card {
  padding: 24px 20px;
  background: #fff;
  border: 1px solid var(--home-line);
  border-radius: 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.category-card:hover {
  background: #fff;
  border-color: var(--home-accent);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.category-icon-el {
  color: var(--home-accent);
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--home-ink);
}

/* Books Section */
.books-section {
  padding: 40px 0;
}

.books-section .section-header {
  flex-direction: row;
  justify-content: space-between;
  text-align: left;
  align-items: center;
  margin-bottom: 28px;
}

.books-section .section-title {
  margin: 0;
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 36px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--home-ink);
  letter-spacing: -0.02em;
  margin: 0 0 8px;
}

.section-subtitle {
  font-size: 14px;
  color: var(--home-muted);
  margin: 0;
  font-weight: 500;
}

.view-all {
  color: var(--home-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-all:hover {
  color: var(--home-accent);
}

.view-all {
  color: var(--home-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-all:hover {
  color: var(--home-accent);
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

/* Book Card */
.book-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-card:hover {
  transform: translateY(-8px);
}

.book-card:active {
  transform: translateY(-4px);
}

.book-image {
  position: relative;
  aspect-ratio: 3/4;
  background: var(--home-bg);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 14px;
  border: 1px solid var(--home-line);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-card:hover .book-image {
  border-color: #cbd5e1;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}

.book-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-card:hover .book-image img {
  transform: scale(1.05);
}

.sold-badge,
.limited-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 12px;
  background: rgba(15, 23, 42, 0.9);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  letter-spacing: 0.02em;
  backdrop-filter: blur(10px);
}

.limited-badge {
  background: rgba(239, 68, 68, 0.95);
}

.book-info {
  padding: 0 4px;
}

.book-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--home-ink);
  margin: 0 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.book-author {
  font-size: 13px;
  color: var(--home-muted);
  margin: 0 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Features Section */
.features-section {
  padding: 60px 0 0;
  border-top: 1px solid var(--home-line);
}

.features-row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.feature-card {
  height: 100%;
  border: 1px solid var(--home-line);
  border-radius: 14px;
  background: #fff;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.feature-card:hover {
  border-color: var(--home-accent);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
  transform: translateY(-4px);
}

.feature-card :deep(.el-card__body) {
  padding: 28px 24px;
  text-align: center;
}

.feature-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.feature-icon-el {
  color: var(--home-accent);
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--home-ink);
  margin: 0 0 8px;
  line-height: 1.4;
}

.feature-desc {
  font-size: 13px;
  color: var(--home-muted);
  margin: 0;
  line-height: 1.6;
}

/* Skeleton */
.book-skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-image {
  aspect-ratio: 3/4;
  background: var(--home-bg);
  border-radius: 12px;
  margin-bottom: 14px;
  border: 1px solid var(--home-line);
}

.skeleton-content {
  padding: 0 4px;
}

.skeleton-text {
  height: 14px;
  background: var(--home-bg);
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-text.short {
  width: 60%;
}

.skeleton-text.shorter {
  width: 40%;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive */
@media (max-width: 768px) {
  .minimal-home {
    padding: 0 16px 60px;
  }

  .hero {
    padding: 60px 16px 40px;
    margin: -16px -16px 0;
  }

  .hero-content {
    padding: 0 16px;
  }

  .hero-title {
    font-size: 26px;
  }

  .hero-subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .hero-search {
    flex-direction: column;
    gap: 10px;
  }

  .search-input,
  .search-btn {
    height: 48px;
    font-size: 14px;
  }

  .search-btn {
    padding: 0 24px;
    justify-content: center;
  }

  /* 移动端响应式 */
  .minimal-home {
    padding: 0 16px 60px;
  }

  .quick-categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats {
    gap: 40px;
    flex-wrap: wrap;
    padding: 30px 20px;
    margin: 0 0 20px;
  }

  .stat-number {
    font-size: 36px;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 12px;
  }

  .category-card {
    padding: 20px 16px;
  }

  .category-icon-el {
    font-size: 24px !important;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .section-title {
    font-size: 22px;
  }

  .features-section {
    padding-top: 48px;
  }

  .features-row :deep(.el-col) {
    margin-bottom: 16px;
  }

  .features-row :deep(.el-col:last-child) {
    margin-bottom: 0;
  }
}
</style>

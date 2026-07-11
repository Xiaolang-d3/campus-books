<template>
  <section class="recommend-banner" v-if="recommendations.length">
    <header class="banner-header">
      <div class="header-inner">
        <div class="header-dot" />
        <h2 class="banner-title">为你精选好书</h2>
        <span class="header-divider" />
        <p class="banner-subtitle">智能推荐 · 基于你的浏览与偏好</p>
      </div>
    </header>

    <el-carousel
      :interval="5000"
      type="card"
      height="340px"
      indicator-position="outside"
      arrow="hover"
      class="recommend-carousel"
      @change="handleChange"
    >
      <el-carousel-item
        v-for="(book, index) in recommendations"
        :key="book.id"
        :class="['recommend-card', { 'is-active': index === activeIndex }]"
      >
        <div class="card-inner" @click="goBookDetail(book.id)">
          <div class="card-cover">
            <img
              :src="getImg(book.cover)"
              :alt="book.title"
              class="cover-img"
              loading="lazy"
            />
            <div class="cover-overlay">
              <span class="view-detail">查看详情</span>
            </div>
          </div>

          <div class="card-content">
            <div class="card-meta">
              <span class="card-category" v-if="book.category_name">
                {{ book.category_name }}
              </span>
              <span class="card-condition" v-if="book.condition_name">
                {{ book.condition_name }}
              </span>
            </div>

            <h3 class="card-title">{{ book.title }}</h3>

            <p class="card-author">
              <span class="meta-label">作者</span>
              <span class="meta-value">{{ book.author || '未知' }}</span>
            </p>

            <p class="card-publisher" v-if="book.publisher">
              <span class="meta-label">出版社</span>
              <span class="meta-value">{{ book.publisher }}</span>
            </p>

            <div class="card-reason">
              <div class="reason-label">
                <el-icon :size="12"><ChatDotRound /></el-icon>
                <span>推荐理由</span>
              </div>
              <p class="reason-text">{{ book.reason }}</p>
            </div>

            <div class="card-footer">
              <div class="card-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ book.price }}</span>
              </div>
              <span class="card-action">
                去看看
                <el-icon :size="14"><ArrowRight /></el-icon>
              </span>
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChatDotRound, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  recommendations: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()
const activeIndex = ref(0)

const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/upload/${v.replace(/^upload\//, '')}`) : ''

const goBookDetail = (id) => {
  router.push(`/front/book/${id}`)
}

const handleChange = (index) => {
  activeIndex.value = index
}
</script>

<style scoped>
.recommend-banner {
  padding: 48px 0 24px;
  overflow: hidden;
}

.banner-header {
  margin-bottom: 32px;
  text-align: center;
}

.header-inner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.header-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366f1;
  margin-bottom: 2px;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
}

.banner-title {
  margin: 0;
  font-size: clamp(22px, 4vw, 30px);
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.04em;
  line-height: 1.2;
}

.header-divider {
  width: 28px;
  height: 2px;
  background: linear-gradient(90deg, #818cf8, #c084fc);
  border-radius: 2px;
  margin: 4px 0;
}

.banner-subtitle {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
  letter-spacing: 0.06em;
  font-weight: 400;
}

.recommend-carousel {
  padding: 6px 0 18px;
}

.recommend-card {
  border-radius: 14px;
  overflow: hidden;
}

.recommend-card :deep(.el-carousel__item) {
  border-radius: 14px;
}

.card-inner {
  display: flex;
  gap: 16px;
  padding: 20px;
  height: 100%;
  min-height: 300px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #ffffff 0%, #fcfcff 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 16px;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  overflow: hidden;
}

.card-inner:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.22);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.1);
}

.card-inner:hover .cover-overlay {
  opacity: 1;
}

.card-inner:hover .cover-img {
  transform: scale(1.04);
}

.card-cover {
  position: relative;
  width: 162px;
  min-width: 162px;
  height: 244px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  transition: transform 0.35s ease;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.06) 0%, rgba(15, 23, 42, 0.42) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.view-detail {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(6px);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 8px;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-category,
.card-condition {
  padding: 4px 10px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  border-radius: 999px;
}

.card-title {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  line-height: 1.42;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-author,
.card-publisher {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 0;
  font-size: 13px;
}

.meta-label {
  color: #94a3b8;
  flex-shrink: 0;
}

.meta-value {
  color: #475569;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-reason {
  flex: 1;
  margin-top: 4px;
  padding: 12px 12px 11px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.92) 0%, rgba(241, 245, 249, 0.92) 100%);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.95);
}

.reason-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
  color: #6366f1;
  font-size: 11px;
  font-weight: 600;
}

.reason-text {
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.card-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 14px;
  font-weight: 600;
  color: #ef4444;
}

.price-value {
  font-size: 24px;
  font-weight: 750;
  color: #ef4444;
  letter-spacing: -0.03em;
}

.card-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #4f46e5;
  font-weight: 600;
  transition: gap 0.2s ease;
}

.card-inner:hover .card-action {
  gap: 6px;
}

:deep(.el-carousel__container) {
  height: 340px;
}

:deep(.el-carousel__item--card) {
  width: 56%;
  border-radius: 14px;
  overflow: visible;
}

:deep(.el-carousel__item--card.is-active) {
  z-index: 3;
}

:deep(.el-carousel__item) {
  border-radius: 14px;
}

:deep(.el-carousel__mask) {
  background-color: transparent;
}

:deep(.el-carousel__button) {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #d7def0;
}

:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background: #6366f1;
  width: 24px;
  border-radius: 999px;
}

@media (max-width: 992px) {
  :deep(.el-carousel__item--card) {
    width: 64%;
  }

  .card-cover {
    width: 146px;
    min-width: 146px;
    height: 220px;
  }

  .card-inner {
    gap: 12px;
    padding: 18px;
  }

  .card-title {
    font-size: 16px;
  }

  .reason-text {
    -webkit-line-clamp: 2;
  }
}

@media (max-width: 768px) {
  .recommend-banner {
    padding: 32px 0 16px;
  }

  .banner-header {
    margin-bottom: 22px;
  }

  .banner-title {
    font-size: 22px;
  }

  .banner-subtitle {
    font-size: 12px;
  }

  .recommend-carousel {
    padding-bottom: 12px;
  }

  :deep(.el-carousel__container) {
    height: 360px !important;
  }

  :deep(.el-carousel__item--card) {
    width: 72%;
  }

  :deep(.el-carousel__item) {
    height: 100% !important;
  }

  .card-inner {
    flex-direction: column;
    padding: 16px;
    min-height: 320px;
  }

  .card-cover {
    width: 100%;
    min-width: 100%;
    height: 190px;
  }

  .card-title {
    font-size: 16px;
    -webkit-line-clamp: 1;
  }

  .card-author,
  .card-publisher {
    font-size: 12px;
  }

  .reason-text {
    -webkit-line-clamp: 2;
  }

  .price-value {
    font-size: 20px;
  }
}
</style>

<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h2>欢迎回来，{{ roleName }}</h2>
        <p>{{ getCurrentGreeting() }}，今天是个美好的一天！</p>
      </div>
      <div class="welcome-time">{{ currentTime }}</div>
    </div>

    <!-- 核心统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card stat-card-blue">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboard.total_users }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card stat-card-green">
          <div class="stat-icon">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboard.on_sale_books }}</div>
            <div class="stat-label">在售书籍</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card stat-card-orange">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboard.total_orders }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card stat-card-red">
          <div class="stat-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ dashboard.total_sales.toFixed(2) }}</div>
            <div class="stat-label">总销售额</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 今日数据 -->
    <el-row :gutter="16" class="today-stats">
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover" class="today-card">
          <div class="today-item">
            <div class="today-icon today-icon-primary">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="today-info">
              <div class="today-label">今日订单</div>
              <div class="today-value">{{ dashboard.today_orders }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover" class="today-card">
          <div class="today-item">
            <div class="today-icon today-icon-success">
              <el-icon><Money /></el-icon>
            </div>
            <div class="today-info">
              <div class="today-label">今日销售额</div>
              <div class="today-value">¥{{ dashboard.today_sales.toFixed(2) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">订单趋势</span>
              <span class="card-subtitle">最近7天</span>
            </div>
          </template>
          <div ref="orderTrendChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">订单状态分布</span>
              <span class="card-subtitle">实时统计</span>
            </div>
          </template>
          <div ref="orderStatusChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">各分类销售额</span>
              <span class="card-subtitle">销售排行</span>
            </div>
          </template>
          <div ref="salesCategoryChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">销售额趋势</span>
              <span class="card-subtitle">最近30天</span>
            </div>
          </template>
          <div ref="salesTrendChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统信息 -->
    <el-card shadow="hover" class="system-info">
      <template #header>
        <div class="card-header">
          <span class="card-title">系统信息</span>
        </div>
      </template>
      <div class="info-content">
        <div class="info-item">
          <span class="info-label">当前角色：</span>
          <el-tag :type="role === 'admin' ? 'danger' : 'primary'">{{ roleMap[role] || role }}</el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">系统说明：</span>
          <span>系统角色已收敛为管理员和校园用户两类，校园用户可同时买书和卖书。</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { User, Reading, Document, Money, ShoppingCart } from '@element-plus/icons-vue'
import http from '@/utils/http'
import * as echarts from 'echarts'
import authStorage from '@/utils/auth'

const role = authStorage.get('role') || 'admin'
const roleMap = { admin: '管理员', yonghu: '校园用户' }
const roleName = roleMap[role] || role
const currentTime = ref('')

const dashboard = ref({
  total_users: 0,
  total_books: 0,
  on_sale_books: 0,
  total_orders: 0,
  completed_orders: 0,
  total_sales: 0,
  today_orders: 0,
  today_sales: 0
})

const orderTrendChart = ref(null)
const orderStatusChart = ref(null)
const salesCategoryChart = ref(null)
const salesTrendChart = ref(null)

const getCurrentGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
}

const updateTime = () => {
  const now = new Date()
  const options = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  }
  currentTime.value = now.toLocaleString('zh-CN', options).replace(/\//g, '-')
}

let timeInterval = null

const loadDashboard = async () => {
  const { data: res } = await http.get('/statistics/dashboard')
  if (res.code === 0) dashboard.value = res.data
}

const initOrderTrendChart = async () => {
  const { data: res } = await http.get('/statistics/order/trend')
  if (res.code !== 0) return

  const chart = echarts.init(orderTrendChart.value)
  chart.setOption({
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    legend: { 
      data: ['总订单', '已支付'],
      top: 10
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: res.data.map(d => d.date),
      axisLine: { lineStyle: { color: '#ddd' } }
    },
    yAxis: { 
      type: 'value',
      axisLine: { lineStyle: { color: '#ddd' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: [
      { 
        name: '总订单', 
        type: 'line', 
        data: res.data.map(d => d.total), 
        smooth: true,
        itemStyle: { color: '#409EFF' },
        areaStyle: { color: 'rgba(64, 158, 255, 0.1)' }
      },
      { 
        name: '已支付', 
        type: 'line', 
        data: res.data.map(d => d.paid), 
        smooth: true,
        itemStyle: { color: '#67C23A' },
        areaStyle: { color: 'rgba(103, 194, 58, 0.1)' }
      }
    ]
  })

  window.addEventListener('resize', () => chart.resize())
}

const initOrderStatusChart = async () => {
  const { data: res } = await http.get('/statistics/order/status')
  if (res.code !== 0) return

  const chart = echarts.init(orderStatusChart.value)
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  
  chart.setOption({
    tooltip: { 
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      data: res.data.map((item, index) => ({
        ...item,
        itemStyle: { color: colors[index % colors.length] }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        formatter: '{b}\n{d}%'
      }
    }]
  })

  window.addEventListener('resize', () => chart.resize())
}

const initSalesCategoryChart = async () => {
  const { data: res } = await http.get('/statistics/sales/category')
  if (res.code !== 0) return

  const chart = echarts.init(salesCategoryChart.value)
  chart.setOption({
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: res.data.map(d => d.name),
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { rotate: 30 }
    },
    yAxis: { 
      type: 'value', 
      name: '销售额(元)',
      axisLine: { lineStyle: { color: '#ddd' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: [{
      type: 'bar',
      data: res.data.map(d => d.value),
      itemStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409EFF' },
          { offset: 1, color: '#66b1ff' }
        ])
      },
      barWidth: '60%'
    }]
  })

  window.addEventListener('resize', () => chart.resize())
}

const initSalesTrendChart = async () => {
  const { data: res } = await http.get('/statistics/sales/trend')
  if (res.code !== 0) return

  const chart = echarts.init(salesTrendChart.value)
  chart.setOption({
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: res.data.map(d => d.date),
      axisLine: { lineStyle: { color: '#ddd' } }
    },
    yAxis: { 
      type: 'value', 
      name: '销售额(元)',
      axisLine: { lineStyle: { color: '#ddd' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: [{
      type: 'line',
      data: res.data.map(d => d.sales),
      smooth: true,
      areaStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      },
      itemStyle: { color: '#409EFF' },
      lineStyle: { width: 3 }
    }]
  })

  window.addEventListener('resize', () => chart.resize())
}

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  await loadDashboard()
  await Promise.all([
    initOrderTrendChart(),
    initOrderStatusChart(),
    initSalesCategoryChart(),
    initSalesTrendChart()
  ])
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped>
/* —— 设计变量：与登录页保持一致 —— */
:root {
  --dash-accent: #2563eb;
  --dash-ink: #0f172a;
  --dash-muted: #64748b;
  --dash-line: #e2e8f0;
}

.dashboard-container {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(165deg, #0f172a 0%, #1e293b 48%, #0f172a 100%);
  border-radius: 16px;
  padding: 28px 36px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #f8fafc;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.15);
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.15;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.3) 0%, transparent 45%),
    radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.15) 0%, transparent 40%);
  pointer-events: none;
}

.welcome-content {
  position: relative;
  z-index: 1;
}

.welcome-content h2 {
  margin: 0 0 8px 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.welcome-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.75;
}

.welcome-time {
  font-size: 15px;
  font-weight: 500;
  opacity: 0.85;
  position: relative;
  z-index: 1;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border: 1px solid var(--dash-line, #e2e8f0);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 110px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
  border-color: #cbd5e1;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: white;
  flex-shrink: 0;
}

.stat-card-blue .stat-icon {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.stat-card-green .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card-orange .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-card-red .stat-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: var(--dash-ink, #0f172a);
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 13px;
  color: var(--dash-muted, #64748b);
  font-weight: 500;
}

/* 今日数据 */
.today-stats {
  margin-bottom: 24px;
}

.today-card {
  border-radius: 14px;
  border: 1px solid var(--dash-line, #e2e8f0);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.today-card :deep(.el-card__body) {
  padding: 20px;
}

.today-item {
  display: flex;
  align-items: center;
  gap: 18px;
}

.today-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.today-icon-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.today-icon-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.today-info {
  flex: 1;
  min-width: 0;
}

.today-label {
  font-size: 13px;
  color: var(--dash-muted, #64748b);
  margin-bottom: 6px;
  font-weight: 500;
}

.today-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--dash-ink, #0f172a);
  letter-spacing: -0.02em;
}

/* 图表区域 */
.chart-row {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 14px;
  height: 100%;
  border: 1px solid var(--dash-line, #e2e8f0);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.chart-card :deep(.el-card__header) {
  border-bottom: 1px solid var(--dash-line, #e2e8f0);
  padding: 18px 20px;
}

.chart-card :deep(.el-card__body) {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dash-ink, #0f172a);
  letter-spacing: -0.01em;
}

.card-subtitle {
  font-size: 12px;
  color: var(--dash-muted, #64748b);
  font-weight: 500;
}

.chart-container {
  height: 320px;
  width: 100%;
}

/* 系统信息 */
.system-info {
  border-radius: 14px;
  border: 1px solid var(--dash-line, #e2e8f0);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.system-info :deep(.el-card__header) {
  border-bottom: 1px solid var(--dash-line, #e2e8f0);
  padding: 18px 20px;
}

.system-info :deep(.el-card__body) {
  padding: 20px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.info-label {
  color: var(--dash-ink, #0f172a);
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .welcome-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 20px 24px;
  }

  .welcome-content h2 {
    font-size: 22px;
  }

  .stat-card {
    height: auto;
    padding: 18px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 22px;
  }

  .stat-value {
    font-size: 26px;
  }

  .today-icon {
    width: 48px;
    height: 48px;
    font-size: 22px;
  }

  .today-value {
    font-size: 22px;
  }

  .chart-container {
    height: 280px;
  }

  .chart-card :deep(.el-card__header),
  .chart-card :deep(.el-card__body),
  .system-info :deep(.el-card__header),
  .system-info :deep(.el-card__body) {
    padding: 16px;
  }
}
</style>

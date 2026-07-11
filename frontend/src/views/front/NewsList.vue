<template>
  <div>
    <el-card>
      <template #header><span style="font-size:18px;font-weight:bold">公告信息</span></template>
      <div v-for="n in list" :key="n.id" class="news-item" @click="$router.push(`/front/news/${n.id}`)">
        <div style="display:flex;gap:16px;align-items:center">
          <img :src="getImg(n.picture)" style="width:160px;height:100px;object-fit:cover;border-radius:4px" />
          <div>
            <div style="font-size:16px;font-weight:bold">{{ n.title }}</div>
            <div style="color:#999;margin-top:8px">{{ n.introduction }}</div>
            <div style="color:#ccc;margin-top:8px;font-size:12px">{{ n.addtime }}</div>
          </div>
        </div>
      </div>
      <div v-if="list.length === 0" style="text-align:center;padding:40px;color:#999">暂无公告</div>
      <el-pagination v-if="total > 0" style="margin-top:16px;justify-content:center" background
        layout="prev, pager, next" :total="total" :page-size="10" v-model:current-page="page" @current-change="loadData" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/utils/http'

const list = ref([])
const total = ref(0)
const page = ref(1)
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''

const loadData = async () => {
  const res = await http.get('/news/list', { params: { page: page.value, limit: 10 } })
  list.value = res.data?.data?.list || []
  total.value = res.data?.data?.total || 0
}

onMounted(loadData)
</script>

<style scoped>
.news-item { padding: 16px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
.news-item:hover { background: #fafafa; }
</style>

<template>
  <div v-if="news">
    <el-card>
      <h2 style="text-align:center">{{ news.title }}</h2>
      <div style="text-align:center;color:#999;margin-bottom:20px">{{ news.addtime }}</div>
      <div v-if="news.picture" style="text-align:center;margin-bottom:20px">
        <img :src="getImg(news.picture)" style="max-width:100%;border-radius:8px" />
      </div>
      <div v-html="news.content" style="line-height:1.8"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import http from '@/utils/http'

const route = useRoute()
const news = ref(null)
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''

onMounted(async () => {
  const res = await http.get(`/news/detail/${route.params.id}`)
  news.value = res.data?.data
})
</script>

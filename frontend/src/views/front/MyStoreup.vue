<template>
  <div>
    <el-card>
      <template #header><span style="font-size:18px;font-weight:bold">我的收藏</span></template>
      <el-row :gutter="16">
        <el-col :span="6" v-for="item in list" :key="item.id">
          <el-card shadow="hover" class="fav-card">
            <img :src="getImg(item.book_cover)" class="fav-img" @click="$router.push(`/front/book/${item.book_id}`)" />
            <div class="fav-info">
              <div class="fav-name" @click="$router.push(`/front/book/${item.book_id}`)">{{ item.book_title || item.name }}</div>
              <el-button text type="danger" size="small" @click="removeFav(item)">取消收藏</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <div v-if="list.length === 0" style="text-align:center;padding:40px;color:#999">暂无收藏</div>
      <el-pagination v-if="total > 0" style="margin-top:16px;justify-content:center" background
        layout="prev, pager, next" :total="total" :page-size="12" v-model:current-page="page" @current-change="loadData" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'
import authStorage from '@/utils/auth'

const list = ref([])
const total = ref(0)
const page = ref(1)
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''

const loadData = async () => {
  const uid = authStorage.get('userid')
  const res = await http.get('/favorite/list', { params: { page: page.value, limit: 12, userid: uid } })
  list.value = res.data?.data?.list || []
  total.value = res.data?.data?.total || 0
}

const removeFav = async (item) => {
  await http.post('/favorite/delete', [item.id])
  ElMessage.success('已取消收藏')
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.fav-card { margin-bottom: 16px; }
.fav-img { width: 100%; height: 160px; object-fit: cover; border-radius: 4px; cursor: pointer; }
.fav-info { padding: 8px 0; display: flex; justify-content: space-between; align-items: center; }
.fav-name { font-weight: bold; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>

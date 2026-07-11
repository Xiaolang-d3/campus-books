<template>
  <div>
    <el-card>
      <template #header>
        <span style="font-size: 18px; font-weight: 700">我的订单</span>
      </template>

      <el-tabs v-model="scopeTab" @tab-change="handleScopeChange">
        <el-tab-pane label="我买的" name="buy" />
        <el-tab-pane label="我卖的" name="sell" />
      </el-tabs>

      <el-tabs v-model="statusTab" @tab-change="loadData">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane label="未支付" name="未支付" />
        <el-tab-pane label="已支付" name="已支付" />
        <el-tab-pane label="已发货" name="已发货" />
        <el-tab-pane label="已完成" name="已完成" />
        <el-tab-pane label="已退款" name="已退款" />
      </el-tabs>

      <el-table :data="list" border>
        <el-table-column label="订单号" prop="order_no" min-width="200" show-overflow-tooltip />
        <el-table-column label="商品" min-width="220">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px">
              <img :src="getImg(row.book_cover)" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px" />
              <span>{{ row.book_title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="scopeTab === 'buy'" label="卖家" min-width="160">
          <template #default="{ row }">
            <span v-if="row.seller_name || row.seller_student_no">
              {{ row.seller_name || '' }}
              <span v-if="row.seller_student_no" class="seller-no">（{{ row.seller_student_no }}）</span>
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column v-else label="收货人" min-width="140" prop="receiver_name" show-overflow-tooltip />
        <el-table-column label="数量" prop="quantity" width="70" />
        <el-table-column label="总价" width="100">
          <template #default="{ row }">￥{{ row.total_amount }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <template v-if="scopeTab === 'buy'">
              <el-button v-if="row.status === '未支付'" type="primary" size="small" @click="pay(row)">支付</el-button>
              <el-button v-if="row.status === '未支付'" size="small" @click="cancel(row)">取消</el-button>
              <el-button v-if="row.status === '已发货'" type="success" size="small" @click="confirm(row)">确认收货</el-button>
              <el-button v-if="row.status === '已支付'" type="warning" size="small" @click="refund(row)">申请退款</el-button>
            </template>
            <template v-else>
              <el-button v-if="row.status === '已支付'" type="primary" size="small" @click="ship(row)">确认发货</el-button>
              <el-button v-if="row.address" size="small" @click="showAddress(row)">查看地址</el-button>
            </template>
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
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'

const router = useRouter()
const list = ref([])
const total = ref(0)
const page = ref(1)
const scopeTab = ref('buy')
const statusTab = ref('')

const getImg = (value) => (value ? (value.startsWith('http') ? value : `/api/file/download/${value}`) : '')

const statusType = (status) =>
  ({ 未支付: 'info', 已支付: 'primary', 已发货: 'warning', 已完成: 'success', 已退款: 'danger' }[status] || 'info')

const loadData = async () => {
  const params = { page: page.value, limit: 10, viewType: scopeTab.value === 'sell' ? 'sell' : 'buy' }
  if (statusTab.value) params.status = statusTab.value
    const res = await http.get('/order/page', { params })
  list.value = res.data?.data?.list || []
  total.value = res.data?.data?.total || 0
}

const handleScopeChange = () => {
  page.value = 1
  loadData()
}

const pay = (row) => {
  router.push(`/front/payment/${row.id}`)
}

const cancel = async (row) => {
  await ElMessageBox.confirm('确定取消该订单吗？', '提示')
    await http.post('/order/update', { id: row.id, status: '已退款' })
  ElMessage.success('订单已取消')
  loadData()
}

const confirm = async (row) => {
    await http.post('/order/update', { id: row.id, status: '已完成' })
  ElMessage.success('已确认收货')
  loadData()
}

const refund = async (row) => {
  await ElMessageBox.confirm('确定申请退款吗？', '提示')
    await http.post('/order/update', { id: row.id, status: '已退款' })
  ElMessage.success('退款成功')
  loadData()
}

const ship = async (row) => {
    await http.post('/order/update', { id: row.id, status: '已发货' })
  ElMessage.success('已发货')
  loadData()
}

const showAddress = (row) => {
  ElMessageBox.alert(`${row.receiver_name} ${row.receiver_phone}\n${row.receiver_address}`, '收货地址')
}

onMounted(loadData)
</script>

<style scoped>
.seller-no {
  color: var(--el-text-color-secondary, #909399);
  font-weight: 400;
}
</style>

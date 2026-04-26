<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.order_no" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="书籍名称">
          <el-input v-model="searchForm.book_title" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="未支付" value="未支付" />
            <el-option label="已支付" value="已支付" />
            <el-option label="已发货" value="已发货" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已退款" value="已退款" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" @selection-change="sel => selectedIds = sel.map(r=>r.id)" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="order_no" label="订单编号" min-width="160" />
        <el-table-column prop="book_title" label="书籍名称" min-width="180" />
        <el-table-column label="封面" width="80">
          <template #default="{ row }">
            <el-image v-if="row.book_cover" :src="getImg(row.book_cover)" style="width:50px;height:50px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="condition_name" label="新旧程度" width="100" />
        <el-table-column prop="quantity" label="数量" width="70" />
        <el-table-column prop="price" label="单价" width="80">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="total_amount" label="总价" width="90">
          <template #default="{ row }">¥{{ row.total_amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pay_type" label="支付方式" width="100">
          <template #default="{ row }">
            {{ payTypeText(row.pay_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="receiver_name" label="收货人" width="100" />
        <el-table-column prop="receiver_phone" label="电话" width="120" />
        <el-table-column prop="receiver_address" label="收货地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="addtime" label="下单时间" width="160" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status==='未支付'" size="small" type="success" @click="changeStatus(row, '已支付')">支付</el-button>
            <el-button v-if="row.status==='已支付'" size="small" type="warning" @click="changeStatus(row, '已发货')">发货</el-button>
            <el-button v-if="row.status==='已发货'" size="small" type="primary" @click="changeStatus(row, '已完成')">确认收货</el-button>
            <el-button v-if="row.status==='已支付'||row.status==='已发货'" size="small" type="info" @click="changeStatus(row, '已退款')">退款</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination style="margin-top:16px;justify-content:flex-end" v-model:current-page="page"
        v-model:page-size="limit" :total="total" :page-sizes="[10,20,50]"
        layout="total, sizes, prev, pager, next" @change="loadData" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'

const route = useRoute()
const searchForm = reactive({ order_no: '', book_title: '', status: '' })
const tableData = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const selectedIds = ref([])

const getImg = (value) => (value ? (value.startsWith('http') ? value : `/api/file/download/${value}`) : '')

const statusType = (s) => ({
  '未支付': 'danger', '已支付': 'warning', '已发货': '', '已完成': 'success', '已退款': 'info'
}[s] || '')

const payTypeText = (t) => ({ 1: '余额', 2: '支付宝' }[t] || '-')

const loadData = async () => {
  const status = route.params.status || ''
  const { data: res } = await http.get('/order/page', { params: { ...searchForm, status, page: page.value, limit: limit.value } })
  if (res.code === 0) { tableData.value = res.data.list; total.value = res.data.total }
}

const resetSearch = () => {
  Object.assign(searchForm, { order_no: '', book_title: '', status: '' })
  loadData()
}

const changeStatus = async (row, status) => {
  await ElMessageBox.confirm(`确定将订单状态改为"${status}"？`)
  const { data: res } = await http.post('/order/update', { id: row.id, status })
  if (res.code === 0) { ElMessage.success('操作成功'); loadData() }
  else { ElMessage.error(res.msg) }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除？')
  const { data: res } = await http.post('/order/delete', [id])
  if (res.code === 0) { ElMessage.success('删除成功'); loadData() }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return ElMessage.warning('请选择数据')
  await ElMessageBox.confirm(`确定删除${selectedIds.value.length}条？`)
  const { data: res } = await http.post('/order/delete', selectedIds.value)
  if (res.code === 0) { ElMessage.success('删除成功'); loadData() }
}

watch(() => route.params.status, loadData)
onMounted(loadData)
</script>

<template>
  <div>
    <el-card>
      <template #header><span style="font-size:18px;font-weight:bold">确认订单</span></template>
      <!-- 收货地址 -->
      <div style="margin-bottom:20px">
        <div style="font-weight:bold;margin-bottom:12px">收货地址</div>
        <el-radio-group v-model="selectedAddr" v-if="addrList.length">
          <el-radio v-for="a in addrList" :key="a.id" :value="a.id" style="display:block;margin-bottom:8px">
            {{ a.contact_name }} {{ a.phone }} - {{ a.detail }} <el-tag v-if="a.is_default===1" size="small" type="warning">默认</el-tag>
          </el-radio>
        </el-radio-group>
        <el-button text type="primary" @click="showAddrForm = true">+ 新增地址</el-button>
      </div>
      <el-divider />
      <!-- 商品列表 -->
      <el-table :data="items">
        <el-table-column label="商品" min-width="200">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:12px">
              <img :src="getImg(row.book_cover || row.picture)" style="width:50px;height:50px;object-fit:cover;border-radius:4px" />
              <span>{{ row.book_title || row.goodname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="100">
          <template #default="{ row }">¥{{ Number(row.book_price ?? row.price ?? 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="数量" width="80">
          <template #default="{ row }">{{ row.quantity ?? row.buynumber ?? 0 }}</template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            ¥{{ (Number(row.book_price ?? row.price ?? 0) * Number(row.quantity ?? row.buynumber ?? 0)).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
      <el-divider />
      <div style="display:flex;justify-content:flex-end;align-items:center;gap:20px">
        <el-input v-model="remark" placeholder="备注（选填）" style="width:300px" />
        <span style="font-size:22px;color:#f56c6c;font-weight:bold">合计：¥{{ totalPrice }}</span>
        <el-button type="danger" size="large" @click="submitOrder" :loading="submitting">提交订单</el-button>
      </div>
    </el-card>

    <!-- 新增地址弹窗 -->
    <el-dialog v-model="showAddrForm" title="新增地址" width="500px">
        <el-form :model="addrForm" label-width="80px">
        <el-form-item label="收货人"><el-input v-model="addrForm.contact_name" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="addrForm.phone" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="addrForm.detail" /></el-form-item>
        <el-form-item label="默认地址"><el-switch v-model="addrForm.is_default" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddrForm = false">取消</el-button>
        <el-button type="primary" @click="saveAddr">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const router = useRouter()
const items = ref(JSON.parse(sessionStorage.getItem('checkout_items') || '[]'))
const addrList = ref([])
const selectedAddr = ref(null)
const remark = ref('')
const submitting = ref(false)
const showAddrForm = ref(false)
const addrForm = ref({ contact_name: '', phone: '', detail: '', is_default: 0 })
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''
const totalPrice = computed(() =>
  items.value
    .reduce((s, r) => s + Number(r.book_price ?? r.price ?? 0) * Number(r.quantity ?? r.buynumber ?? 0), 0)
    .toFixed(2)
)

const loadAddr = async () => {
  const res = await http.get('/address/list', { params: { page: 1, limit: 100 } })
  addrList.value = res.data?.data?.list || []
  const def = addrList.value.find(a => a.is_default === 1)
  if (def) selectedAddr.value = def.id
  else if (addrList.value.length) selectedAddr.value = addrList.value[0].id
}

const saveAddr = async () => {
  if (!addrForm.value.contact_name || !addrForm.value.phone || !addrForm.value.detail) return ElMessage.warning('请填写完整')
  await http.post('/address/save', addrForm.value)
  showAddrForm.value = false
  addrForm.value = { contact_name: '', phone: '', detail: '', is_default: 0 }
  loadAddr()
}

const submitOrder = async () => {
  if (!selectedAddr.value) return ElMessage.warning('请选择收货地址')
  if (!items.value.length) return ElMessage.warning('没有商品')
  submitting.value = true

  try {
    let lastOrderId = null
    const addr = addrList.value.find(a => a.id === selectedAddr.value)

    // 提交订单时带上地址快照
    for (const item of items.value) {
      const quantity = Number(item.quantity ?? item.buynumber ?? 0)
      const price = Number(item.book_price ?? item.price ?? 0)
      const bookId = item.book_id ?? item.goodid

      const res = await http.post('/order/save', {
        book_id: bookId,
        quantity,
        price,
        total_amount: price * quantity,
        type: 1,
        status: '未支付',
        remark: remark.value,
        receiver_name: addr?.contact_name || '',
        receiver_phone: addr?.phone || '',
        receiver_address: addr
          ? `${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.detail || ''}`
          : ''
      })
      lastOrderId = res.data?.data?.id

      // 删除购物车项
      if (item.id) await http.post('/cart/delete', [item.id])
    }

    ElMessage.success('下单成功，请前往支付')
    sessionStorage.removeItem('checkout_items')

    // 跳转到支付页面
    if (lastOrderId) {
      router.push(`/front/payment/${lastOrderId}`)
    } else {
      router.push('/front/orders')
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.msg || '下单失败，请检查库存')
  } finally {
    submitting.value = false
  }
}

onMounted(loadAddr)
</script>

<template>
  <div class="payment-container">
    <el-card class="payment-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><ShoppingBag /></el-icon>
          <span>订单支付</span>
        </div>
      </template>

      <el-skeleton :loading="loading" animated>
        <template #template>
          <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 16px" />
          <el-skeleton-item variant="text" style="width: 40%; margin-bottom: 16px" />
          <el-skeleton-item variant="text" style="width: 50%" />
        </template>

        <template #default>
          <div v-if="orderInfo.order_no" class="order-info">
            <div class="info-row">
              <span class="label">订单编号</span>
              <span class="value">{{ orderInfo.order_no }}</span>
            </div>
            <div class="info-row">
              <span class="label">书籍名称</span>
              <span class="value">{{ orderInfo.book_title }}</span>
            </div>
            <div class="info-row">
              <span class="label">购买数量</span>
              <span class="value">{{ orderInfo.quantity }}</span>
            </div>
            <div class="info-row">
              <span class="label">收货地址</span>
              <span class="value">{{ orderInfo.receiver_address }}</span>
            </div>
            <div class="info-row">
              <span class="label">收货人</span>
              <span class="value">{{ orderInfo.receiver_name }} {{ orderInfo.receiver_phone }}</span>
            </div>
            <div class="total-row">
              <span class="label">应付金额</span>
              <span class="amount">￥{{ Number(orderInfo.total_amount || 0).toFixed(2) }}</span>
            </div>
          </div>
        </template>
      </el-skeleton>

      <el-divider />

      <div class="payment-method">
        <div class="method-title">支付方式</div>
        <div class="balance-method">
          <div class="method-item">
            <el-icon class="method-icon"><Wallet /></el-icon>
            <div class="method-info">
              <div class="method-name">余额支付</div>
              <div class="method-desc">当前余额：￥{{ Number(balance || 0).toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>

      <el-alert
        v-if="insufficientBalance"
        title="余额不足，请先到钱包充值"
        type="error"
        show-icon
        :closable="false"
        style="margin-top: 16px"
      >
        <template #default>
          <div>当前余额：￥{{ Number(balance || 0).toFixed(2) }}</div>
          <div>应付金额：￥{{ orderAmount.toFixed(2) }}</div>
          <div>还需充值：￥{{ (orderAmount - Number(balance || 0)).toFixed(2) }}</div>
        </template>
      </el-alert>

      <div class="payment-actions">
        <el-button size="large" @click="$router.back()">返回</el-button>
        <el-button size="large" @click="goWallet" :disabled="!insufficientBalance">
          去充值
        </el-button>
        <el-button
          type="primary"
          size="large"
          @click="handlePay"
          :loading="paying"
          :disabled="insufficientBalance || loading"
        >
          确认支付 ￥{{ orderAmount.toFixed(2) }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingBag, Wallet } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'
import authStorage from '@/utils/auth'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const paying = ref(false)
const orderInfo = ref({})
const balance = ref(0)

const orderAmount = computed(() => Number(orderInfo.value.total_amount || 0))
const insufficientBalance = computed(() => Number(balance.value || 0) < orderAmount.value)

const loadOrder = async () => {
  loading.value = true
  try {
    const res = await http.get(`/order/info/${route.params.id}`)
    orderInfo.value = res.data?.data || {}
    orderInfo.value.total_amount = Number(orderInfo.value.total_amount || 0)

    if (orderInfo.value.status !== '未支付') {
      ElMessage.warning('该订单当前状态不能支付')
      router.back()
    }
  } catch (e) {
    ElMessage.error('获取订单信息失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const loadBalance = async () => {
  try {
    const res = await http.get('/wallet/balance')
    balance.value = Number(res.data?.data?.balance || 0)
  } catch (e) {
    if (e.response?.status === 401 || e.response?.data?.msg?.includes('登录')) {
      ElMessage.error('登录已失效，请重新登录')
      authStorage.clear()
      router.push('/login')
      return
    }
    balance.value = 0
  }
}

const goWallet = () => {
  router.push('/front/wallet')
}

const handlePay = async () => {
  if (insufficientBalance.value) {
    ElMessage.warning('余额不足，请先充值')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认使用余额支付 ￥${orderAmount.value.toFixed(2)} 吗？`,
      '确认支付',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    paying.value = true
    await http.post('/wallet/pay', { orderid: orderInfo.value.order_no })
    ElMessage.success('支付成功')
    window.dispatchEvent(new Event('balance-updated'))
    setTimeout(() => {
      router.push('/front/orders')
    }, 800)
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e.response?.data?.msg || '支付失败')
      await loadBalance()
    }
  } finally {
    paying.value = false
  }
}

onMounted(async () => {
  await loadOrder()
  await loadBalance()
})
</script>

<style scoped>
.payment-container {
  max-width: 700px;
  margin: 40px auto;
}

.payment-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.order-info {
  padding: 16px 0;
}

.info-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  width: 100px;
  color: #666;
  flex-shrink: 0;
}

.info-row .value {
  flex: 1;
  color: #1a1a1a;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-top: 16px;
  border-top: 2px solid #f0f0f0;
}

.total-row .label {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.total-row .amount {
  font-size: 28px;
  font-weight: 700;
  color: #ff4d4f;
}

.payment-method {
  margin-top: 24px;
}

.method-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.balance-method {
  padding: 16px;
  border: 1px solid #409eff;
  background: #f0f7ff;
  border-radius: 8px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-icon {
  font-size: 24px;
  color: #409eff;
}

.method-info {
  flex: 1;
  text-align: left;
}

.method-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 12px;
  color: #666;
}

.payment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .payment-container {
    margin: 16px;
  }

  .info-row {
    flex-direction: column;
    gap: 4px;
  }

  .info-row .label {
    width: auto;
  }

  .total-row .amount {
    font-size: 24px;
  }

  .payment-actions {
    flex-direction: column-reverse;
  }

  .payment-actions .el-button {
    width: 100%;
  }
}
</style>

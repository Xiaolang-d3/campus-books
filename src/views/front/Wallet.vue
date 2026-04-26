<template>
  <div class="wallet-container">
    <el-card class="balance-card" shadow="never">
      <div class="balance-header">
        <div class="balance-info">
          <div class="balance-label">当前余额</div>
          <div class="balance-amount">￥{{ Number(balance || 0).toFixed(2) }}</div>
        </div>
        <el-button type="primary" @click="showRechargeDialog = true">
          <el-icon><Plus /></el-icon>
          充值
        </el-button>
      </div>
    </el-card>

    <el-dialog
      v-model="showRechargeDialog"
      title="支付宝充值"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="rechargeForm" :rules="rechargeRules" ref="rechargeFormRef" label-width="80px">
        <el-form-item label="充值金额" prop="amount">
          <el-input-number
            v-model="rechargeForm.amount"
            :min="1"
            :max="10000"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
        </el-form-item>
        <div class="recharge-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>充值会生成支付宝二维码，扫码支付成功后自动入账余额。</span>
        </div>
        <div class="quick-amounts">
          <el-button v-for="amt in [50, 100, 200, 500]" :key="amt" @click="rechargeForm.amount = amt">
            {{ amt }}元
          </el-button>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showRechargeDialog = false">取消</el-button>
        <el-button type="primary" @click="handleRecharge" :loading="recharging">
          生成支付宝二维码
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="qrDialogVisible"
      title="支付宝扫码充值"
      width="420px"
      :close-on-click-modal="false"
      @closed="stopRechargePolling"
    >
      <div class="qr-pay-box">
        <canvas ref="qrCanvas" class="qr-canvas" />
        <div class="qr-order">充值单号：{{ rechargePayInfo.rechargeNo }}</div>
        <div class="qr-amount">￥{{ Number(rechargePayInfo.amount || 0).toFixed(2) }}</div>
        <el-alert
          :title="qrPayStatus"
          type="info"
          show-icon
          :closable="false"
          class="qr-status"
        />
      </div>
      <template #footer>
        <el-button @click="qrDialogVisible = false">关闭</el-button>
        <el-button
          type="primary"
          :loading="qrChecking"
          @click="rechargePayInfo.mockPay ? mockRechargePayment() : checkRechargePayment(true)"
        >
          {{ rechargePayInfo.mockPay ? '确认支付' : '我已支付，查询结果' }}
        </el-button>
      </template>
    </el-dialog>

    <el-card class="logs-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>钱包明细</span>
          <el-button text @click="loadLogs">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </template>

      <el-skeleton :loading="loading" animated :count="5">
        <template #template>
          <div v-for="i in 5" :key="i" class="log-item-skeleton">
            <el-skeleton-item variant="text" style="width: 60%" />
            <el-skeleton-item variant="text" style="width: 30%; margin-top: 8px" />
          </div>
        </template>

        <template #default>
          <el-empty v-if="!logs.length" description="暂无钱包明细" />
          <div v-else class="logs-list">
            <div v-for="log in logs" :key="log.id" class="log-item">
              <div class="log-icon" :class="getLogTypeClass(log.type)">
                <el-icon v-if="log.type === '充值'"><Plus /></el-icon>
                <el-icon v-else-if="log.type === '消费'"><Minus /></el-icon>
                <el-icon v-else-if="log.type === '退款'"><RefreshLeft /></el-icon>
                <el-icon v-else><Money /></el-icon>
              </div>
              <div class="log-content">
                <div class="log-title">{{ log.remark }}</div>
                <div class="log-time">{{ log.addtime }}</div>
                <div v-if="log.orderid" class="log-order">单号：{{ log.orderid }}</div>
              </div>
              <div class="log-amount" :class="log.amount > 0 ? 'income' : 'expense'">
                {{ log.amount > 0 ? '+' : '' }}￥{{ Math.abs(log.amount).toFixed(2) }}
              </div>
            </div>
          </div>

          <el-pagination
            v-if="total > 0"
            style="margin-top: 24px; justify-content: center"
            background
            layout="total, prev, pager, next"
            :total="total"
            :page-size="pageSize"
            v-model:current-page="page"
            @current-change="loadLogs"
          />
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { Refresh, Plus, Minus, RefreshLeft, Money, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import QRCode from 'qrcode'
import http from '@/utils/http'

const balance = ref(0)
const logs = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(false)

const showRechargeDialog = ref(false)
const recharging = ref(false)
const rechargeForm = ref({ amount: 100 })
const rechargeFormRef = ref(null)
const rechargeRules = {
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { type: 'number', min: 1, max: 10000, message: '充值金额范围为 1-10000 元', trigger: 'blur' }
  ]
}

const qrDialogVisible = ref(false)
const qrCanvas = ref(null)
const rechargePayInfo = ref({})
const qrPayStatus = ref('请使用支付宝扫码支付，支付完成后系统会自动查询结果。')
const qrChecking = ref(false)
let rechargePollTimer = null

const loadBalance = async () => {
  try {
    const res = await http.get('/wallet/balance')
    balance.value = Number(res.data?.data?.balance || 0)
  } catch (e) {
    console.error(e)
  }
}

const loadLogs = async () => {
  loading.value = true
  try {
    const res = await http.get('/wallet/logs', {
      params: { page: page.value, limit: pageSize }
    })
    logs.value = res.data?.data?.list || []
    total.value = res.data?.data?.total || 0
  } catch (e) {
    ElMessage.error('获取钱包明细失败')
  } finally {
    loading.value = false
  }
}

const handleRecharge = async () => {
  const amount = Number(rechargeForm.value.amount || 0)
  if (!amount || amount <= 0) {
    ElMessage.warning('请输入正确的充值金额')
    return
  }
  if (amount > 10000) {
    ElMessage.warning('单次充值金额不能超过 10000 元')
    return
  }

  try {
    await rechargeFormRef.value?.validate()
    recharging.value = true
    const res = await http.post('/alipay/recharge/precreate', { amount })
    if (res.data?.code !== 0) {
      ElMessage.error(res.data?.msg || '支付宝充值二维码创建失败')
      return
    }
    const qrCode = res.data?.data?.qrCode
    if (!qrCode) {
      ElMessage.error(res.data?.msg || '未获取到支付宝充值二维码')
      return
    }

    rechargePayInfo.value = res.data.data
    qrPayStatus.value = res.data.data?.mockPay
      ? '当前为本地支付模式，二维码仅用于演示，点击“确认支付”即可完成充值。'
      : '请使用支付宝扫码支付，支付完成后系统会自动查询结果。'
    showRechargeDialog.value = false
    qrDialogVisible.value = true
    await nextTick()
    await renderQrCode(qrCode)
    if (!rechargePayInfo.value.mockPay) {
      startRechargePolling()
    }
  } catch (e) {
    if (e !== false) {
      ElMessage.error(e.response?.data?.msg || '支付宝充值二维码创建失败')
    }
  } finally {
    recharging.value = false
  }
}

const renderQrCode = async (qrCode) => {
  if (!qrCanvas.value) return
  await QRCode.toCanvas(qrCanvas.value, qrCode, {
    width: 240,
    margin: 1,
    color: {
      dark: '#111827',
      light: '#ffffff'
    }
  })
}

const startRechargePolling = () => {
  stopRechargePolling()
  rechargePollTimer = window.setInterval(() => {
    checkRechargePayment(false)
  }, 3000)
}

const stopRechargePolling = () => {
  if (rechargePollTimer) {
    window.clearInterval(rechargePollTimer)
    rechargePollTimer = null
  }
}

const checkRechargePayment = async (manual = false) => {
  if (!rechargePayInfo.value.rechargeId || qrChecking.value) return
  qrChecking.value = true
  try {
    const res = await http.get('/alipay/recharge/query', {
      params: { rechargeId: rechargePayInfo.value.rechargeId }
    })
    if (res.data?.code !== 0) {
      if (manual) ElMessage.error(res.data?.msg || '查询充值状态失败')
      return
    }

    const data = res.data?.data || {}
    if (data.paid) {
      stopRechargePolling()
      qrPayStatus.value = '充值成功，余额已更新。'
      ElMessage.success('充值成功')
      qrDialogVisible.value = false
      rechargeForm.value.amount = 100
      await loadBalance()
      await loadLogs()
      window.dispatchEvent(new Event('balance-updated'))
      return
    }

    qrPayStatus.value = data.message || '等待支付完成，请扫码后稍候。'
    if (manual) ElMessage.info('暂未查询到支付成功，请稍后再试')
  } catch (e) {
    if (manual) {
      ElMessage.error(e.response?.data?.msg || '查询充值状态失败')
    }
  } finally {
    qrChecking.value = false
  }
}

const mockRechargePayment = async () => {
  if (!rechargePayInfo.value.rechargeId || qrChecking.value) return
  qrChecking.value = true
  try {
    const res = await http.post('/alipay/recharge/mockPay', {
      rechargeId: rechargePayInfo.value.rechargeId
    })
    if (res.data?.code !== 0) {
      ElMessage.error(res.data?.msg || '支付失败')
      return
    }

    stopRechargePolling()
    qrPayStatus.value = '支付成功，余额已更新。'
    ElMessage.success('支付成功')
    qrDialogVisible.value = false
    rechargeForm.value.amount = 100
    await loadBalance()
    await loadLogs()
    window.dispatchEvent(new Event('balance-updated'))
  } catch (e) {
    ElMessage.error(e.response?.data?.msg || '支付失败')
  } finally {
    qrChecking.value = false
  }
}

const getLogTypeClass = (type) => {
  const map = {
    '充值': 'recharge',
    '消费': 'expense',
    '退款': 'refund',
    '收入': 'income'
  }
  return map[type] || 'default'
}

onMounted(() => {
  loadBalance()
  loadLogs()
})

onUnmounted(() => {
  stopRechargePolling()
})
</script>

<style scoped>
.wallet-container {
  max-width: 900px;
  margin: 0 auto;
}

.balance-card {
  margin-bottom: 24px;
  border-radius: 12px;
  background: #0f766e;
  color: white;
}

.balance-card :deep(.el-card__body) {
  padding: 32px;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 42px;
  font-weight: 700;
  letter-spacing: 0;
}

.balance-header :deep(.el-button) {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: white;
}

.balance-header :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.26);
  border-color: rgba(255, 255, 255, 0.6);
}

.recharge-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  color: #389e0d;
  font-size: 13px;
}

.quick-amounts {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
}

.quick-amounts .el-button {
  flex: 1;
}

.qr-pay-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qr-canvas {
  width: 240px;
  height: 240px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.qr-order {
  color: #666;
  font-size: 13px;
}

.qr-amount {
  color: #ff4d4f;
  font-size: 28px;
  font-weight: 700;
}

.qr-status {
  width: 100%;
}

.logs-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.log-item-skeleton {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.logs-list {
  min-height: 200px;
}

.log-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.log-item:hover {
  background: #fafafa;
  margin: 0 -16px;
  padding: 16px;
  border-radius: 8px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.log-icon.recharge {
  background: #e6f7ff;
  color: #1890ff;
}

.log-icon.expense {
  background: #fff1f0;
  color: #ff4d4f;
}

.log-icon.refund {
  background: #fff7e6;
  color: #faad14;
}

.log-icon.income {
  background: #f6ffed;
  color: #52c41a;
}

.log-content {
  flex: 1;
  margin-left: 16px;
}

.log-title {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.log-time {
  font-size: 12px;
  color: #999;
}

.log-order {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.log-amount {
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

.log-amount.income {
  color: #52c41a;
}

.log-amount.expense {
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .balance-card :deep(.el-card__body) {
    padding: 24px;
  }

  .balance-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .balance-amount {
    font-size: 36px;
  }

  .quick-amounts {
    flex-wrap: wrap;
  }

  .quick-amounts .el-button {
    min-width: 40%;
  }

  .log-item {
    flex-wrap: wrap;
  }

  .log-amount {
    width: 100%;
    text-align: right;
    margin-top: 8px;
  }
}
</style>

<template>
  <div class="cart-container">
    <el-card class="cart-card">
      <template #header>
        <div class="cart-header">
          <div class="header-left">
            <el-icon><ShoppingCart /></el-icon>
            <span>我的购物车</span>
            <el-tag v-if="cartList.length" type="info" size="small">{{ cartList.length }} 件商品</el-tag>
          </div>
          <el-button
            v-if="cartList.length"
            text
            type="danger"
            @click="clearCart"
          >
            <el-icon><Delete /></el-icon> 清空购物车
          </el-button>
        </div>
      </template>

      <el-skeleton :loading="loading" animated :rows="3">
        <template #default>
          <div v-if="cartList.length === 0" class="empty-cart">
            <el-empty description="购物车是空的">
              <el-button type="primary" @click="$router.push('/front/books')">
                去逛逛
              </el-button>
            </el-empty>
          </div>

          <div v-else>
            <div class="cart-actions">
              <el-checkbox
                v-model="selectAll"
                @change="toggleSelectAll"
                :indeterminate="isIndeterminate"
              >
                全选
              </el-checkbox>
              <el-button
                text
                type="danger"
                :disabled="!selected.length"
                @click="batchDelete"
              >
                删除选中
              </el-button>
            </div>

            <div class="cart-items">
              <div
                v-for="item in cartList"
                :key="item.id"
                class="cart-item"
                :class="{ selected: isSelected(item) }"
              >
                <el-checkbox
                  :model-value="isSelected(item)"
                  @change="toggleSelect(item)"
                  class="item-checkbox"
                />
                <div class="item-image" @click="viewBook(item)">
                  <img :src="getImg(item.book_cover)" />
                </div>
                <div class="item-info" @click="viewBook(item)">
                  <div class="item-name">{{ item.book_title }}</div>
                </div>
                <div class="item-price">
                  <span class="price-label">单价</span>
                  <span class="price-value">¥{{ item.book_price }}</span>
                </div>
                <div class="item-quantity">
                  <span class="quantity-label">数量</span>
                  <el-input-number
                    v-model="item.quantity"
                    :min="1"
                    :max="99"
                    size="small"
                    @change="updateQty(item)"
                  />
                </div>
                <div class="item-subtotal">
                  <span class="subtotal-label">小计</span>
                  <span class="subtotal-value">¥{{ (item.book_price * item.quantity).toFixed(2) }}</span>
                </div>
                <div class="item-actions">
                  <el-button
                    text
                    type="danger"
                    @click="removeItem(item)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </el-card>

    <el-card v-if="cartList.length" class="checkout-card">
      <div class="checkout-content">
        <div class="checkout-info">
          <span class="info-item">
            已选 <span class="highlight">{{ selected.length }}</span> 件商品
          </span>
          <span class="info-item">
            共 <span class="highlight">{{ totalQuantity }}</span> 件
          </span>
        </div>
        <div class="checkout-price">
          <span class="price-label">合计：</span>
          <span class="price-value">¥{{ totalPrice }}</span>
        </div>
        <el-button
          type="danger"
          size="large"
          :disabled="!selected.length"
          @click="goCheckout"
          class="checkout-btn"
        >
          去结算 ({{ selected.length }})
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart, Delete } from '@element-plus/icons-vue'
import http from '@/utils/http'

const router = useRouter()
const loading = ref(true)
const cartList = ref([])
const selected = ref([])
const selectAll = ref(false)

const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''

const totalPrice = computed(() =>
  selected.value.reduce((s, r) => s + (r.book_price || 0) * r.quantity, 0).toFixed(2)
)

const totalQuantity = computed(() =>
  selected.value.reduce((s, r) => s + r.quantity, 0)
)

const isIndeterminate = computed(() =>
  selected.value.length > 0 && selected.value.length < cartList.value.length
)

const isSelected = (item) => selected.value.some(s => s.id === item.id)

const loadCart = async () => {
  loading.value = true
  try {
    const res = await http.get('/cart/page', { params: { page: 1, limit: 999 } })
    cartList.value = res.data?.data?.list || []
  } catch (e) {
    ElMessage.error('加载购物车失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

const toggleSelect = (item) => {
  const index = selected.value.findIndex(s => s.id === item.id)
  if (index > -1) {
    selected.value.splice(index, 1)
  } else {
    selected.value.push(item)
  }
  selectAll.value = selected.value.length === cartList.value.length
}

const toggleSelectAll = (checked) => {
  selected.value = checked ? [...cartList.value] : []
}

const updateQty = async (row) => {
  try {
    await http.post('/cart/update', { id: row.id, quantity: row.quantity })
    ElMessage.success('数量已更新')
  } catch (e) {
    ElMessage.error(e.response?.data?.msg || '更新失败')
    loadCart()
  }
}

const removeItem = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该商品？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await http.post('/cart/delete', [row.id])
    ElMessage.success('已删除')
    selected.value = selected.value.filter(s => s.id !== row.id)
    loadCart()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 件商品？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const ids = selected.value.map(s => s.id)
    await http.post('/cart/delete', ids)
    ElMessage.success('已删除')
    selected.value = []
    selectAll.value = false
    loadCart()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const clearCart = async () => {
  try {
    await ElMessageBox.confirm('确定清空购物车？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const ids = cartList.value.map(item => item.id)
    await http.post('/cart/delete', ids)
    ElMessage.success('购物车已清空')
    cartList.value = []
    selected.value = []
    selectAll.value = false
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('清空失败')
    }
  }
}

const viewBook = (item) => {
  router.push(`/front/book/${item.book_id}`)
}

const goCheckout = () => {
  sessionStorage.setItem('checkout_items', JSON.stringify(selected.value))
  router.push('/front/order-confirm')
}

onMounted(loadCart)
</script>

<style scoped>
.cart-container {
  min-height: calc(100vh - 200px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.cart-card {
  border-radius: 4px;
  margin-bottom: 24px;
  border: 1px solid #e5e5e5;
  box-shadow: none;
}

.cart-card :deep(.el-card__header) {
  border-bottom: 1px solid #e5e5e5;
  padding: 20px 32px;
}

.cart-card :deep(.el-card__body) {
  padding: 32px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #0a0a0a;
}

.header-left :deep(.el-tag) {
  background: #fafafa;
  border-color: #e5e5e5;
  color: #737373;
}

.empty-cart {
  padding: 80px 0;
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #e5e5e5;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  transition: all 0.2s;
}

.cart-item:hover {
  border-color: #d4d4d4;
}

.cart-item.selected {
  background: #fafafa;
  border-color: #0a0a0a;
}

.item-checkbox {
  flex-shrink: 0;
}

.item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e5e5e5;
  background: #fafafa;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.item-image:hover img {
  transform: scale(1.05);
}

.item-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #0a0a0a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.item-name:hover {
  color: #737373;
}

.item-price,
.item-quantity,
.item-subtotal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.price-label,
.quantity-label,
.subtotal-label {
  font-size: 12px;
  color: #a3a3a3;
  font-weight: 500;
}

.price-value {
  font-size: 16px;
  color: #0a0a0a;
  font-weight: 600;
}

.subtotal-value {
  font-size: 20px;
  color: #0a0a0a;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.item-actions {
  flex-shrink: 0;
}

.checkout-card {
  position: sticky;
  bottom: 0;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
  box-shadow: none;
}

.checkout-card :deep(.el-card__body) {
  padding: 24px 32px;
}

.checkout-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

.checkout-info {
  display: flex;
  gap: 32px;
  color: #737373;
  font-size: 14px;
}

.info-item .highlight {
  color: #0a0a0a;
  font-weight: 600;
  font-size: 18px;
}

.checkout-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.checkout-price .price-label {
  font-size: 16px;
  color: #737373;
}

.checkout-price .price-value {
  font-size: 32px;
  color: #0a0a0a;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.checkout-btn {
  min-width: 180px;
  height: 48px;
  font-size: 16px;
  background: #0a0a0a;
  border-color: #0a0a0a;
}

.checkout-btn:hover {
  background: #2a2a2a;
  border-color: #2a2a2a;
}

@media (max-width: 768px) {
  .cart-container {
    padding: 20px 16px;
  }

  .cart-card :deep(.el-card__header),
  .cart-card :deep(.el-card__body) {
    padding: 20px;
  }

  .cart-item {
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-info {
    flex: 1 1 100%;
    order: 3;
  }

  .item-price,
  .item-quantity,
  .item-subtotal {
    flex-direction: row;
    gap: 4px;
  }

  .checkout-card :deep(.el-card__body) {
    padding: 20px;
  }

  .checkout-content {
    flex-direction: column;
    gap: 16px;
  }

  .checkout-info {
    width: 100%;
    justify-content: space-around;
  }

  .checkout-btn {
    width: 100%;
  }
}
</style>

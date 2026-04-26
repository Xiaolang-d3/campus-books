<template>
  <div class="ai-chat-page">
    <!-- 页面标题栏 -->
    <div class="chat-header">
      <div class="header-left">
        <el-button text @click="$router.back()" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>

        <div class="ai-info">
          <div class="ai-avatar">
            <el-icon :size="22"><ChatDotRound /></el-icon>
          </div>
          <div class="ai-meta">
            <div class="ai-title-row">
              <span class="ai-name">小书</span>
              <span class="ai-badge">校园 AI 助手</span>
            </div>
            <div class="ai-status">
              <span class="status-dot"></span>
              <span>在线 · 可咨询找书 / 发布 / 购买问题</span>
            </div>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <el-button text @click="showSessions = true" class="action-btn">
          <el-icon><ChatLineRound /></el-icon>
          <span>历史</span>
        </el-button>
        <el-button text @click="createNewSession" class="action-btn">
          <el-icon><Plus /></el-icon>
          <span>新对话</span>
        </el-button>
      </div>
    </div>

    <!-- 消息列表区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="welcome-section">
        <div class="welcome-icon">
          <el-icon :size="52"><ChatDotRound /></el-icon>
          <div class="icon-pulse"></div>
        </div>

        <h2 class="welcome-title">你好，我是小书！</h2>
        <p class="welcome-desc">
          我可以帮你推荐教材、解释购买流程、指导发布二手书，
          也能根据专业和课程方向给出选书建议。
        </p>

        <!-- 功能卡片 -->
        <div class="feature-cards">
          <div class="feature-card" @click="sendQuickQuestion('有什么算法书推荐吗？')">
            <div class="card-icon"><el-icon><Reading /></el-icon></div>
            <div class="card-text">
              <span class="card-title">书籍推荐</span>
              <span class="card-desc">根据课程、方向和预算推荐合适书籍</span>
            </div>
          </div>

          <div class="feature-card" @click="sendQuickQuestion('如何发布一本书？')">
            <div class="card-icon"><el-icon><Upload /></el-icon></div>
            <div class="card-text">
              <span class="card-title">发布指导</span>
              <span class="card-desc">快速了解上架步骤、图片与描述要点</span>
            </div>
          </div>

          <div class="feature-card" @click="sendQuickQuestion('购买流程是怎样的？')">
            <div class="card-icon"><el-icon><ShoppingCart /></el-icon></div>
            <div class="card-text">
              <span class="card-title">购书指南</span>
              <span class="card-desc">从下单到支付、发货到收货一目了然</span>
            </div>
          </div>

          <div class="feature-card" @click="sendQuickQuestion('计算机专业大一用什么教材？')">
            <div class="card-icon"><el-icon><Collection /></el-icon></div>
            <div class="card-text">
              <span class="card-title">教材咨询</span>
              <span class="card-desc">按专业、年级和课程推荐常见教材</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="messages-list">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-item', msg.role]"
        >
          <!-- 头像 -->
          <div v-if="msg.role === 'assistant'" class="message-avatar ai-avatar">
            <el-icon :size="18"><ChatDotRound /></el-icon>
          </div>
          <div v-else class="message-avatar user-avatar">
            <el-icon :size="16"><User /></el-icon>
          </div>

          <!-- 消息气泡 -->
          <div class="message-bubble-wrapper">
            <div class="message-meta">
              <span class="message-role">{{ msg.role === 'assistant' ? '小书' : '我' }}</span>
              <span v-if="msg.time" class="message-time-inline">{{ msg.time }}</span>
            </div>

            <!-- 文本消息 -->
            <div v-if="!msg.content_type || msg.content_type === 'text'" class="message-bubble">
              <div class="message-content" v-if="msg.role === 'user'">{{ msg.content }}</div>
              <div class="message-content" v-else v-html="formatMessage(msg.content)"></div>
              <span v-if="msg.role === 'assistant' && msg.typing" class="typing-cursor">|</span>
            </div>

            <!-- 书籍卡片列表 -->
            <div v-else-if="msg.content_type === 'book_list' && msg.metadata?.books" class="book-cards-container">
              <div class="message-bubble text-intro">
                <div class="message-content" v-html="formatMessage(msg.content)"></div>
              </div>
              <div class="book-cards">
                <div v-for="book in msg.metadata.books" :key="book.id" class="book-card">
                  <img :src="getImg(book.cover)" class="book-cover" @click="viewBook(book.id)" />
                  <div class="book-info">
                    <h4 class="book-title" @click="viewBook(book.id)">{{ book.title }}</h4>
                    <p class="book-author">{{ book.author }}</p>
                    <div class="book-meta">
                      <span v-if="book.condition" class="book-condition">{{ book.condition }}</span>
                      <span class="book-stock">库存: {{ book.stock }}</span>
                    </div>
                    <div class="book-price-row">
                      <span class="book-price">¥{{ book.price.toFixed(2) }}</span>
                      <span v-if="book.original_price > book.price" class="book-original-price">
                        ¥{{ book.original_price.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                  <div class="book-actions">
                    <el-button size="small" @click="viewBook(book.id)">查看详情</el-button>
                    <el-button size="small" type="primary" @click="addToCart(book.id)" :disabled="book.stock <= 0">
                      {{ book.stock > 0 ? '加入购物车' : '已售罄' }}
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <div class="message-actions">
              <el-tooltip content="复制" placement="top">
                <button class="action-icon" @click="copyMessage(msg.content)">
                  <el-icon><CopyDocument /></el-icon>
                </button>
              </el-tooltip>
            </div>
          </div>
        </div>

        <!-- AI 思考中 -->
        <div v-if="sending" class="message-item assistant">
          <div class="message-avatar ai-avatar">
            <el-icon :size="18"><ChatDotRound /></el-icon>
          </div>
          <div class="message-bubble-wrapper">
            <div class="message-meta">
              <span class="message-role">小书</span>
              <span class="thinking-text">正在整理回答…</span>
            </div>
            <div class="message-bubble thinking">
              <div class="thinking-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷功能栏 -->
    <div v-if="messages.length > 0" class="quick-actions-bar">
      <el-button
        v-for="action in quickActions"
        :key="action.id"
        size="small"
        class="quick-action-btn"
        @click="sendQuickQuestion(action.prompt)"
        :disabled="sending"
      >
        <el-icon><component :is="action.icon" /></el-icon>
        <span>{{ action.label }}</span>
      </el-button>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <div v-if="!isLoggedIn()" class="login-notice">
        <span>登录后可与小书继续对话，并获得更精准的校园二手书推荐。</span>
        <el-button type="primary" link @click="goLogin">立即登录</el-button>
      </div>

      <div class="input-wrapper">
        <div class="input-container">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="1"
            :autosize="{ minRows: 1, maxRows: 4 }"
            maxlength="500"
            placeholder="请输入你的问题，例如：计算机专业大一适合买哪些教材？"
            @keydown.enter.exact.prevent="handleSend"
            ref="inputRef"
            :disabled="sending"
            class="chat-input"
          />
        </div>

        <el-button
          type="primary"
          @click="handleSend"
          :disabled="!inputMessage.trim() || sending"
          class="send-btn"
        >
          <el-icon v-if="!sending"><Promotion /></el-icon>
          <el-icon v-else class="loading-icon"><Loading /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 历史会话侧边栏 -->
    <el-drawer v-model="showSessions" title="历史对话" size="360px">
      <div class="sessions-list">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="session-item"
          :class="{ active: currentSessionId === session.id }"
          @click="loadSession(session.id)"
        >
          <div class="session-info">
            <h4 class="session-title">{{ session.title }}</h4>
            <p class="session-preview">{{ session.preview }}</p>
            <span class="session-time">{{ formatSessionTime(session.last_message_time) }}</span>
          </div>
          <el-button
            text
            type="danger"
            size="small"
            @click.stop="deleteSession(session.id)"
            class="session-delete"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <div v-if="sessions.length === 0" class="empty-sessions">
          <el-empty description="暂无历史对话" :image-size="80" />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  MagicStick,
  User,
  Delete,
  Promotion,
  CopyDocument,
  Loading,
  Reading,
  Upload,
  ShoppingCart,
  Collection,
  ChatLineRound,
  Plus,
  ChatDotRound
} from '@element-plus/icons-vue'
import http from '@/utils/http'
import authStorage from '@/utils/auth'

const router = useRouter()

const messages = ref([])
const inputMessage = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const inputRef = ref(null)
const currentSessionId = ref(null)
const sessions = ref([])
const showSessions = ref(false)

const quickActions = [
  { id: 'find-book', label: '找书', icon: 'Reading', prompt: '推荐几本书' },
  { id: 'sell-book', label: '发布', icon: 'Upload', prompt: '如何发布一本书？' },
  { id: 'buy-guide', label: '购买', icon: 'ShoppingCart', prompt: '购买流程是怎样的？' },
  { id: 'recommend', label: '推荐', icon: 'Collection', prompt: '推荐一些教材' }
]

const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : '/placeholder-book.png'

const isLoggedIn = () => authStorage.hasToken()

const goLogin = () => {
  router.push('/login')
}

// 加载会话列表
const loadSessions = async () => {
  try {
    const res = await http.get('/chat/sessions')
    sessions.value = res.data?.data?.sessions || []
  } catch (e) {
    console.error('加载会话列表失败', e)
  }
}

// 加载会话消息
const loadSession = async (sessionId) => {
  try {
    const res = await http.get(`/chat/session/${sessionId}`)
    const sessionMessages = res.data?.data?.messages || []
    
    messages.value = sessionMessages.map(m => ({
      role: m.role,
      content: m.content,
      content_type: m.content_type,
      metadata: m.metadata,
      time: formatTime(m.addtime)
    }))
    
    currentSessionId.value = sessionId
    showSessions.value = false
    await scrollToBottom()
  } catch (e) {
    ElMessage.error('加载会话失败')
    console.error(e)
  }
}

// 创建新会话
const createNewSession = async () => {
  try {
    const res = await http.post('/chat/session/new')
    const newSession = res.data?.data?.session
    if (newSession) {
      currentSessionId.value = newSession.id
      messages.value = []
      await loadSessions()
      ElMessage.success('已创建新对话')
    }
  } catch (e) {
    ElMessage.error('创建新对话失败')
    console.error(e)
  }
}

// 删除会话
const deleteSession = async (sessionId) => {
  try {
    await ElMessageBox.confirm('确定删除这个对话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await http.delete(`/chat/session/${sessionId}`)
    
    if (currentSessionId.value === sessionId) {
      currentSessionId.value = null
      messages.value = []
    }
    
    await loadSessions()
    ElMessage.success('对话已删除')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 格式化时间
const formatTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 格式化会话时间
const formatSessionTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}-${day}`
}

// 发送消息
const handleSend = async () => {
  const content = inputMessage.value.trim()
  if (!content || sending.value) return

  if (!isLoggedIn()) {
    ElMessage.warning('请先登录后再使用 AI 助手')
    return
  }

  inputMessage.value = ''
  if (inputRef.value) {
    inputRef.value.resizeTextarea()
  }

  messages.value.push({
    role: 'user',
    content,
    time: formatTime(new Date())
  })
  await scrollToBottom()

  sending.value = true

  try {
    const res = await http.post('/chat/send', {
      message: content,
      session_id: currentSessionId.value
    })

    if (res.data?.code === 0) {
      const data = res.data.data
      currentSessionId.value = data.session_id
      
      await appendAssistantMessage({
        content: data.reply || '抱歉，我暂时没有组织好回答。',
        content_type: data.content_type,
        metadata: data.metadata
      })
      
      // 刷新会话列表
      await loadSessions()
    } else {
      const message = res.data?.msg || '发送失败，请稍后重试'
      ElMessage.error(message)
      await appendAssistantMessage({
        content: `抱歉，当前无法完成回答：${message}`,
        content_type: 'text'
      })
    }
  } catch (e) {
    console.error('发送消息失败', e)
    const status = e.response?.status
    const message =
      status === 401
        ? '登录状态已失效，请重新登录后再试'
        : (e.response?.data?.msg || '网络异常，请稍后重试')
    ElMessage.error(message)
    await appendAssistantMessage({
      content: `抱歉，当前无法完成回答：${message}`,
      content_type: 'text'
    })
  } finally {
    sending.value = false
    await nextTick()
    inputRef.value?.focus()
  }
}

// 添加AI消息（带打字机效果）
const appendAssistantMessage = async (msgData) => {
  const msg = {
    role: 'assistant',
    content: '',
    content_type: msgData.content_type || 'text',
    metadata: msgData.metadata,
    typing: true
  }
  
  messages.value.push(msg)
  await scrollToBottom()
  
  // 打字机效果
  const text = msgData.content
  for (let i = 0; i < text.length; i++) {
    msg.content += text[i]
    if (i % 5 === 0) {
      await scrollToBottom()
    }
    await sleep(20)
  }
  
  msg.typing = false
  msg.time = formatTime(new Date())
  await scrollToBottom()
}

// 辅助函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// 发送快捷问题
const sendQuickQuestion = async (question) => {
  inputMessage.value = question
  await nextTick()
  handleSend()
}

// 复制消息
const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

// 格式化消息（支持简单 Markdown）
const formatMessage = (content) => {
  if (!content) return ''
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
  
  return escapeHtml(content)
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>')
}

// 查看书籍详情
const viewBook = (bookId) => {
  router.push(`/front/book/${bookId}`)
}

// 加入购物车
const addToCart = async (bookId) => {
  try {
    await http.post('/cart/add', {
      book_id: bookId,
      quantity: 1
    })
    ElMessage.success('已加入购物车')
  } catch (e) {
    ElMessage.error(e.response?.data?.msg || '加入购物车失败')
  }
}

onMounted(async () => {
  if (isLoggedIn()) {
    await loadSessions()
    // 如果有会话，加载最近的一个
    if (sessions.value.length > 0) {
      await loadSession(sessions.value[0].id)
    }
  }
  nextTick(() => {
    inputRef.value?.focus()
    scrollToBottom()
  })
})
</script>

<style scoped>
.ai-chat-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px - 20px);
  height: calc(100vh - 64px - 20px);
  max-width: 1000px;
  margin: 0 auto;
  background: #fafaf9;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

/* 标题栏 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e7e5e4;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  font-size: 20px;
  padding: 8px;
  color: #78716c;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #ea580c;
  background: #fff7ed;
  border-radius: 8px;
}

.ai-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
}

.ai-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-name {
  font-size: 16px;
  font-weight: 700;
  color: #1c1917;
  letter-spacing: -0.01em;
}

.ai-badge {
  padding: 3px 8px;
  border-radius: 6px;
  background: #fff7ed;
  color: #ea580c;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid #fed7aa;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #78716c;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  color: #78716c;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s;
  background: #fafaf9;
  border: 1px solid #e7e5e4;
}

.action-btn:hover {
  background: #fff7ed;
  color: #ea580c;
  border-color: #fed7aa;
}

/* 消息区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
  background: #fafaf9;
}

/* 欢迎界面 */
.welcome-section {
  text-align: center;
  padding: 40px 24px;
  max-width: 680px;
  margin: 0 auto;
}

.welcome-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: #fff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  position: relative;
  box-shadow: 0 8px 24px rgba(234, 88, 12, 0.25);
}

.icon-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  animation: iconPulse 2s ease-out infinite;
  z-index: -1;
}

@keyframes iconPulse {
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(1.4); opacity: 0; }
}

.welcome-title {
  font-size: 32px;
  font-weight: 800;
  color: #1c1917;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.welcome-desc {
  font-size: 15px;
  color: #78716c;
  margin: 0 auto 32px;
  line-height: 1.7;
  max-width: 560px;
}

/* 功能卡片 */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 680px;
  margin: 0 auto;
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1.5px solid #e7e5e4;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.feature-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 8px 24px rgba(234, 88, 12, 0.12);
  transform: translateY(-4px);
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ea580c;
  font-size: 20px;
  flex-shrink: 0;
  border: 1px solid #fed7aa;
}

.card-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1c1917;
  letter-spacing: -0.01em;
}

.card-desc {
  font-size: 13px;
  color: #78716c;
  line-height: 1.5;
}

/* 消息列表 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar.ai-avatar {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(234, 88, 12, 0.2);
}

.message-avatar.user-avatar {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.message-bubble-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 75%;
  gap: 4px;
}

.message-item.user .message-bubble-wrapper {
  align-items: flex-end;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.message-role {
  font-size: 12px;
  font-weight: 600;
  color: #57534e;
}

.message-time-inline {
  font-size: 11px;
  color: #a8a29e;
}

.message-bubble {
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

.message-item.user .message-bubble {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-item.assistant .message-bubble {
  background: #fff;
  color: #1c1917;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e7e5e4;
  border-bottom-left-radius: 4px;
}

.message-content {
  white-space: pre-wrap;
}

.message-content :deep(ul) {
  margin: 10px 0;
  padding-left: 20px;
}

.message-content :deep(.inline-code) {
  background: #fff7ed;
  color: #ea580c;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  border: 1px solid #fed7aa;
}

/* 书籍卡片 */
.book-cards-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.text-intro {
  background: #fff;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e7e5e4;
}

.book-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.book-card {
  display: flex;
  gap: 14px;
  padding: 14px;
  background: #fff;
  border-radius: 12px;
  border: 1.5px solid #e7e5e4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: #f59e0b;
  transform: translateY(-2px);
}

.book-cover {
  width: 90px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.book-title {
  font-size: 15px;
  font-weight: 700;
  color: #1c1917;
  margin: 0;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.book-title:hover {
  color: #ea580c;
}

.book-author {
  font-size: 13px;
  color: #78716c;
  margin: 0;
}

.book-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
}

.book-condition {
  padding: 3px 8px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-weight: 600;
}

.book-stock {
  color: #78716c;
}

.book-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
}

.book-price {
  font-size: 20px;
  font-weight: 800;
  color: #dc2626;
  letter-spacing: -0.02em;
}

.book-original-price {
  font-size: 13px;
  color: #a8a29e;
  text-decoration: line-through;
}

.book-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.book-actions :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
}

/* 消息操作 */
.message-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-bubble-wrapper:hover .message-actions {
  opacity: 1;
}

.action-icon {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: #909399;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.action-icon:hover {
  background: #fff7ed;
  color: #ea580c;
}

/* 思考中动画 */
.message-bubble.thinking {
  padding: 14px 20px;
}

.thinking-dots {
  display: flex;
  gap: 4px;
}

.thinking-dots span {
  width: 8px;
  height: 8px;
  background: #909399;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.typing-cursor {
  display: inline-block;
  animation: blink 0.8s infinite;
  color: #ea580c;
  font-weight: bold;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 快捷功能栏 */
.quick-actions-bar {
  display: flex;
  gap: 10px;
  padding: 14px 20px;
  background: #fff;
  border-top: 1px solid #e7e5e4;
  overflow-x: auto;
  flex-shrink: 0;
}

.quick-action-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  background: #fff7ed;
  border: 1.5px solid #fed7aa;
  color: #ea580c;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.quick-action-btn:hover {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: #fff;
  border-color: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2);
}

/* 输入区域 */
.chat-input-area {
  padding: 20px 24px;
  background: #fff;
  border-top: 1px solid #e7e5e4;
  flex-shrink: 0;
}

.login-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  color: #92400e;
  font-size: 13px;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-container {
  flex: 1;
}

.chat-input :deep(.el-textarea__inner) {
  border-radius: 12px;
  padding: 14px 18px;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  background: #fafaf9;
  border: 1.5px solid #e7e5e4;
  transition: all 0.2s;
}

.chat-input :deep(.el-textarea__inner:focus) {
  border-color: #f59e0b;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.send-btn {
  height: 46px;
  padding: 0 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  border: none;
  flex-shrink: 0;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(234, 88, 12, 0.3);
}

.send-btn:active:not(:disabled) {
  transform: translateY(0);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 历史会话 */
.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.2s;
}

.session-item:hover {
  background: #f5f7fa;
  border-color: #f59e0b;
}

.session-item.active {
  background: #fff7ed;
  border-color: #f59e0b;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-preview {
  font-size: 12px;
  color: #909399;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-time {
  font-size: 11px;
  color: #c0c4cc;
}

.session-delete {
  opacity: 0;
  transition: opacity 0.2s;
}

.session-item:hover .session-delete {
  opacity: 1;
}

.empty-sessions {
  padding: 40px 20px;
  text-align: center;
}

/* 滚动条 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

/* 响应式 */
@media (max-width: 768px) {
  .ai-chat-page {
    min-height: calc(100vh - 56px);
    height: calc(100vh - 56px);
    border-radius: 0;
    margin: 0;
    max-width: none;
  }

  .feature-cards {
    grid-template-columns: 1fr;
  }

  .message-bubble-wrapper {
    max-width: 88%;
  }

  .book-card {
    flex-direction: column;
  }

  .book-cover {
    width: 100%;
    height: 180px;
  }

  .book-actions {
    flex-direction: row;
  }

  .quick-actions-bar {
    padding: 10px 12px;
  }

  .action-btn span {
    display: none;
  }
}
</style>

<template>
  <div class="auth-page">
    <!-- 左侧品牌区 -->
    <aside class="auth-brand" aria-hidden="false">
      <div class="auth-brand__pattern" />
      <div class="auth-brand__inner">
        <div class="auth-brand__mark">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="auth-brand__title">校园二手专业书籍在线交易平台</h1>
        <p class="auth-brand__slogan">让知识在校园流动</p>
        <ul class="auth-brand__bullets">
          <li>二手教材 · 专业对口</li>
          <li>校内交易 · 更安心</li>
        </ul>
      </div>
    </aside>

    <!-- 右侧表单区 -->
    <main class="auth-main">
      <div class="auth-card">
        <header class="auth-card__head">
          <h2 class="auth-card__title">欢迎回来</h2>
          <p class="auth-card__desc">登录你的校园二手专业书籍在线交易平台账号</p>
        </header>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="auth-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item label="身份" prop="role" class="auth-form__role">
            <div class="role-seg" role="tablist">
              <button
                type="button"
                role="tab"
                :aria-selected="form.role === 'yonghu'"
                :class="['role-seg__btn', { 'is-active': form.role === 'yonghu' }]"
                @click="form.role = 'yonghu'"
              >
                学生用户
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="form.role === 'admin'"
                :class="['role-seg__btn', { 'is-active': form.role === 'admin' }]"
                @click="form.role = 'admin'"
              >
                管理员
              </button>
            </div>
          </el-form-item>

          <el-form-item :label="form.role === 'admin' ? '账号' : '学号'" prop="username">
            <el-input
              v-model="form.username"
              :placeholder="form.role === 'admin' ? '请输入管理员账号' : '请输入学号'"
              size="large"
              clearable
              autocomplete="username"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              clearable
              autocomplete="current-password"
            />
          </el-form-item>

          <div class="auth-form__row">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <span class="auth-form__hint">忘记密码请联系管理员</span>
          </div>

          <el-form-item class="auth-form__submit">
            <el-button type="primary" size="large" class="auth-submit" :loading="loading" @click="handleLogin">
              {{ loading ? '登录中…' : '登录' }}
            </el-button>
          </el-form-item>

          <p class="auth-card__footer">
            还没有账号？
            <el-link type="primary" :underline="false" @click="$router.push('/register')">立即注册</el-link>
          </p>
        </el-form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'
import authStorage from '@/utils/auth'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const rememberMe = ref(false)

const form = reactive({ username: '', password: '', role: 'yonghu' })
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 管理员登录时检查账号
    if (form.role === 'admin' && form.username !== 'admin') {
      ElMessage.warning('管理员账号只能是 admin，普通用户请选择"学生用户"身份登录')
      return
    }
    
    loading.value = true
    try {
      const { data: res } = await http.post('/login', form)
      if (res.code !== 0) {
        ElMessage.error(res.msg || '登录失败')
        return
      }
      authStorage.clear()
      authStorage.set('token', res.data.token)
      authStorage.set('role', form.role)
      authStorage.set('tableName', form.role === 'admin' ? 'admin' : 'user')
      authStorage.set('userid', res.data.userid)
      authStorage.set('username', res.data.username)
      ElMessage.success('登录成功，欢迎回来！')
      setTimeout(() => {
        // 管理员跳转到后台，普通用户跳转到前台
        router.push(form.role === 'admin' ? '/home' : '/front/home')
      }, 400)
    } catch (error) {
      ElMessage.error(error.response?.data?.msg || '登录失败，请检查网络连接')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
/* —— 设计变量：克制、偏编辑/图书馆气质 —— */
.auth-page {
  --auth-accent: #2563eb;
  --auth-accent-hover: #1d4ed8;
  --auth-ink: #0f172a;
  --auth-muted: #64748b;
  --auth-line: #e2e8f0;
  --auth-bg: #f8fafc;

  min-height: 100vh;
  display: flex;
  flex-direction: row;
  background: var(--auth-bg);
  color: var(--auth-ink);
}

/* 左侧品牌 */
.auth-brand {
  position: relative;
  flex: 0 0 42%;
  max-width: 520px;
  min-height: 100vh;
  background: linear-gradient(165deg, #0f172a 0%, #1e293b 48%, #0f172a 100%);
  color: #f8fafc;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

.auth-brand__pattern {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.25) 0%, transparent 45%),
    radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.12) 0%, transparent 40%);
  pointer-events: none;
}

.auth-brand__pattern::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(248, 250, 252, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(248, 250, 252, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%);
}

.auth-brand__inner {
  position: relative;
  z-index: 1;
  max-width: 320px;
}

.auth-brand__mark {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}

.auth-brand__mark svg {
  width: 28px;
  height: 28px;
  color: #fff;
}

.auth-brand__title {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.2;
}

.auth-brand__slogan {
  margin: 0 0 32px;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(248, 250, 252, 0.72);
}

.auth-brand__bullets {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 14px;
  line-height: 2;
  color: rgba(248, 250, 252, 0.55);
}

.auth-brand__bullets li::before {
  content: '·';
  margin-right: 10px;
  color: rgba(96, 165, 250, 0.8);
}

/* 右侧主区 */
.auth-main {
  flex: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 48px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border: 1px solid var(--auth-line);
  border-radius: 16px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 40px rgba(15, 23, 42, 0.06);
  padding: 40px 36px 36px;
}

.auth-card__head {
  margin-bottom: 28px;
}

.auth-card__title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: var(--auth-ink);
  letter-spacing: -0.02em;
}

.auth-card__desc {
  margin: 0;
  font-size: 14px;
  color: var(--auth-muted);
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.auth-form :deep(.el-form-item__label) {
  color: var(--auth-ink);
  font-weight: 500;
  font-size: 13px;
  padding-bottom: 6px;
}

.auth-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px var(--auth-line) inset;
  background: #fff;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.auth-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) inset, 0 0 0 1px var(--auth-accent) inset;
}

.auth-form__role :deep(.el-form-item__label) {
  margin-bottom: 0;
}

.role-seg {
  display: flex;
  gap: 0;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 12px;
  border: 1px solid var(--auth-line);
  flex-wrap: nowrap;
  min-width: 0;
}

.role-seg__btn {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--auth-muted);
  padding: 10px 16px;
  border-radius: 9px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.2s, background 0.2s, box-shadow 0.2s;
  white-space: nowrap;
  text-align: center;
  min-width: 0;
}

.role-seg__btn:hover {
  color: var(--auth-ink);
}

.role-seg__btn.is-active {
  background: #fff;
  color: var(--auth-accent);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.auth-form__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.auth-form :deep(.el-checkbox__label) {
  font-size: 13px;
  color: var(--auth-muted);
}

.auth-form__hint {
  font-size: 12px;
  color: #94a3b8;
}

.auth-form__submit {
  margin-bottom: 0;
  margin-top: 8px;
}

.auth-submit {
  width: 100%;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  background: var(--auth-accent);
}

.auth-submit:hover {
  background: var(--auth-accent-hover);
}

.auth-card__footer {
  margin: 24px 0 0;
  text-align: center;
  font-size: 14px;
  color: var(--auth-muted);
}

.auth-card__footer :deep(.el-link) {
  font-weight: 600;
  color: var(--auth-accent);
}

.auth-card__footer :deep(.el-link:hover) {
  color: var(--auth-accent-hover);
}

/* 平板及以下：品牌区收折到顶部 */
@media (max-width: 900px) {
  .auth-page {
    flex-direction: column;
  }

  .auth-brand {
    flex: none;
    max-width: none;
    min-height: auto;
    width: 100%;
    padding: 32px 24px 28px;
    align-items: flex-start;
  }

  .auth-brand__inner {
    max-width: none;
  }

  .auth-brand__title {
    font-size: 24px;
  }

  .auth-brand__bullets {
    display: none;
  }

  .auth-main {
    min-height: auto;
    padding: 24px 20px 40px;
  }

  .auth-card {
    padding: 32px 24px 28px;
  }
}
</style>

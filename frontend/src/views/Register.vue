<template>
  <div class="auth-page">
    <aside class="auth-brand">
      <div class="auth-brand__pattern" />
      <div class="auth-brand__inner">
        <div class="auth-brand__mark">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="auth-brand__title">校园二手专业书籍在线交易平台</h1>
        <p class="auth-brand__slogan">开启你的知识交易之旅</p>
        <ul class="auth-brand__bullets">
          <li>一次注册 · 买书卖书</li>
          <li>信息仅用于校内身份核验</li>
        </ul>
      </div>
    </aside>

    <main class="auth-main">
      <div class="auth-card auth-card--wide">
        <header class="auth-card__head">
          <h2 class="auth-card__title">创建账号</h2>
          <p class="auth-card__desc">填写以下信息完成学生用户注册</p>
        </header>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="auth-form">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12">
              <el-form-item label="学号" prop="username">
                <el-input v-model="form.username" placeholder="请输入学号" size="large" clearable autocomplete="username" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入真实姓名" size="large" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="学院" prop="xueyuan">
            <el-input v-model="form.xueyuan" placeholder="如：计算机学院" size="large" clearable />
          </el-form-item>

          <el-row :gutter="16">
            <el-col :xs="24" :sm="12">
              <el-form-item label="专业" prop="zhuanye">
                <el-input v-model="form.zhuanye" placeholder="如：软件工程" size="large" clearable />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="年级" prop="nianji">
                <el-input v-model="form.nianji" placeholder="如：2022级" size="large" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="至少 6 位"
              size="large"
              show-password
              clearable
              autocomplete="new-password"
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="password2">
            <el-input
              v-model="form.password2"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              show-password
              clearable
              autocomplete="new-password"
            />
          </el-form-item>

          <el-form-item class="auth-form__submit">
            <el-button type="primary" size="large" class="auth-submit" :loading="loading" @click="handleRegister">
              {{ loading ? '提交中…' : '注册' }}
            </el-button>
          </el-form-item>

          <p class="auth-card__footer">
            已有账号？
            <el-link type="primary" :underline="false" @click="$router.push('/login')">立即登录</el-link>
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

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = reactive({
  username: '',
  name: '',
  xueyuan: '',
  zhuanye: '',
  nianji: '',
  password: '',
  password2: '',
})

const validatePassword = (rule, value, callback) => {
  if (value.length < 6) {
    callback(new Error('密码至少需要6位'))
  } else {
    callback()
  }
}

const validatePassword2 = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次密码输入不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 6, max: 20, message: '学号长度在6-20位之间', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在2-10位之间', trigger: 'blur' },
  ],
  xueyuan: [{ required: false, message: '请输入学院', trigger: 'blur' }],
  zhuanye: [{ required: false, message: '请输入专业', trigger: 'blur' }],
  nianji: [{ required: false, message: '请输入年级', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' },
  ],
  password2: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePassword2, trigger: 'blur' },
  ],
}

const handleRegister = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const { data: res } = await http.post('/yonghu/register', {
        student_no: form.username.trim(),
        name: form.name.trim(),
        grade: form.nianji.trim(),
        password: form.password,
      })
      if (res.code === 0) {
        ElMessage.success('注册成功！即将跳转到登录页面')
        setTimeout(() => router.push('/login'), 1200)
      } else {
        ElMessage.error(res.msg || '注册失败')
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.msg || '注册失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
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

.auth-card--wide {
  max-width: 520px;
}

.auth-card__head {
  margin-bottom: 24px;
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
  margin-bottom: 18px;
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
  transition: box-shadow 0.2s ease;
}

.auth-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) inset, 0 0 0 1px var(--auth-accent) inset;
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

@media (max-width: 900px) {
  .auth-page {
    flex-direction: column;
  }

  .auth-brand {
    flex: none;
    max-width: none;
    min-height: auto;
    width: 100%;
    padding: 28px 24px 24px;
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
    padding: 16px 20px 40px;
  }

  .auth-card {
    padding: 28px 22px 24px;
  }
}
</style>

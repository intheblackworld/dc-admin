<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>管理系統登入</h1>
      </div>
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        label-width="80"
        size="large"
      >
        <n-form-item path="account_name" label="帳號">
          <n-input v-model:value="formValue.account_name" placeholder="請輸入帳號" />
        </n-form-item>
        <n-form-item path="password" label="密碼">
          <n-input
            v-model:value="formValue.password"
            type="password"
            placeholder="請輸入密碼"
            @keyup.enter="handleSubmit"
          />
        </n-form-item>
        <n-form-item>
          <n-button
            type="primary"
            block
            :loading="loading"
            :disabled="loading"
            @click="handleSubmit"
          >
            登入
          </n-button>
        </n-form-item>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import { login } from '../lib/api'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formValue = reactive({
  account_name: '',
  password: '',
})

const rules = {
  account_name: {
    required: true,
    message: '請輸入帳號',
    trigger: 'blur',
  },
  password: {
    required: true,
    message: '請輸入密碼',
    trigger: 'blur',
  },
}

const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return

    loading.value = true
    try {
      const res = await login(formValue.account_name, formValue.password)
      if (res.status === 0) {
        // 儲存必要資訊到 localStorage
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('admin_id', res.data.admin_id.toString())
        localStorage.setItem('account_name', res.data.account_name)
        localStorage.setItem('role_id', res.data.role_id.toString())

        message.success('登入成功')
        router.push('/')
      } else {
        message.error(res.message || '登入失敗')
      }
    } catch (error) {
      console.error('登入錯誤:', error)
      if (error instanceof Error) {
        message.error(error.message || '登入時發生錯誤，請稍後再試')
      } else {
        message.error('登入時發生錯誤，請稍後再試')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  width: 420px;
  padding: 40px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  margin: 0;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}
</style>

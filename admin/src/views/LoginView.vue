<template>
  <div class="login-page">
    <el-card class="login-card" shadow="always">
      <div class="login-title">暖爪 WarmPaws</div>
      <div class="login-subtitle">流浪动物救助管理后台</div>

      <el-form :model="form" label-position="top" @submit.prevent="submit">
        <el-form-item label="账号">
          <el-input v-model="form.username" size="large" placeholder="用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            size="large"
            type="password"
            show-password
            placeholder="密码"
            @keyup.enter="submit"
          />
        </el-form-item>
        <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="submit">
          登录
        </el-button>
      </el-form>

      <div class="login-hint">默认账号 admin / admin123</div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../api/admin'
import { setSession } from '../api/client'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: 'admin123'
})

async function submit() {
  if (!form.username.trim() || !form.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  loading.value = true
  try {
    const data = await login(form.username.trim(), form.password)
    setSession(data.token, data.admin)
    ElMessage.success('登录成功')
    router.replace('/dashboard')
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

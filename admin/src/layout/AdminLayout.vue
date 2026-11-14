<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="admin-aside">
      <div class="admin-logo">暖爪管理后台</div>
      <el-menu :default-active="$route.path" router>
        <el-menu-item index="/dashboard">数据概览</el-menu-item>
        <el-menu-item index="/submissions">投稿审核</el-menu-item>
        <el-menu-item index="/adoptions">领养申请</el-menu-item>
        <el-menu-item index="/animals">动物档案</el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div class="admin-header__title">{{ title }}</div>
        <div class="admin-header__right">
          <span>{{ adminName }}</span>
          <el-button link type="danger" @click="logout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAdmin, clearSession } from '../api/client'

const route = useRoute()
const router = useRouter()

const adminName = computed(() => {
  const admin = getAdmin()
  return (admin && (admin.nickname || admin.username)) || '管理员'
})

const title = computed(() => route.meta.title || '管理后台')

function logout() {
  clearSession()
  router.replace('/login')
}
</script>

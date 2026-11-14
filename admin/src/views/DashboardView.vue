<template>
  <div>
    <el-row :gutter="16" class="stat-grid">
      <el-col :span="6" v-for="card in cards" :key="card.key">
        <el-card class="stat-card" shadow="hover" @click="$router.push(card.to)">
          <div class="stat-card__label">{{ card.label }}</div>
          <div class="stat-card__value">{{ card.value }}</div>
          <div class="stat-card__hint">{{ card.hint }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="page-toolbar" style="margin-bottom: 0">
          <span>最新待审核投稿</span>
          <div class="page-toolbar__spacer"></div>
          <el-button link type="primary" @click="$router.push('/submissions')">查看全部</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="pendingSubmissions">
        <el-table-column prop="name" label="名字" width="140" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">{{ row.type === 'cat' ? '猫' : '狗' }}</template>
        </el-table-column>
        <el-table-column prop="location" label="所在地" min-width="180" />
        <el-table-column prop="contactName" label="投稿人" width="120" />
        <el-table-column prop="createdAt" label="提交时间" width="170" />
        <el-table-column label="状态" width="100">
          <template #default>
            <el-tag type="warning">待审核</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && pendingSubmissions.length === 0" description="暂无待审核投稿" />
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listSubmissions, listAdoptions, listAnimals } from '../api/admin'

const loading = ref(false)
const pendingSubmissions = ref([])
const pendingSubmissionTotal = ref(0)
const pendingAdoptionTotal = ref(0)
const animalTotal = ref(0)
const approvedSubmissionTotal = ref(0)

const cards = computed(() => [
  {
    key: 'submissions',
    label: '待审核投稿',
    value: pendingSubmissionTotal.value,
    hint: '用户上报的流浪动物',
    to: '/submissions'
  },
  {
    key: 'adoptions',
    label: '待审核领养申请',
    value: pendingAdoptionTotal.value,
    hint: '需要联系申请人',
    to: '/adoptions'
  },
  {
    key: 'animals',
    label: '动物档案总数',
    value: animalTotal.value,
    hint: '含已领养与审核中',
    to: '/animals'
  },
  {
    key: 'approved',
    label: '已通过投稿',
    value: approvedSubmissionTotal.value,
    hint: '已生成动物档案',
    to: '/submissions'
  }
])

async function load() {
  loading.value = true
  try {
    const [submissions, adoptions, animals, approved] = await Promise.all([
      listSubmissions({ status: 'pending', page: 1, size: 5 }),
      listAdoptions({ status: 'pending', page: 1, size: 1 }),
      listAnimals({ status: 'all', page: 1, size: 1 }),
      listSubmissions({ status: 'approved', page: 1, size: 1 })
    ])
    pendingSubmissions.value = submissions.list || []
    pendingSubmissionTotal.value = submissions.total || 0
    pendingAdoptionTotal.value = adoptions.total || 0
    animalTotal.value = animals.total || 0
    approvedSubmissionTotal.value = approved.total || 0
  } catch (error) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

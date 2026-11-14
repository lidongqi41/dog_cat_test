<template>
  <div class="page-card">
    <div class="page-toolbar">
      <el-radio-group v-model="status" @change="reload">
        <el-radio-button value="pending">待审核</el-radio-button>
        <el-radio-button value="approved">已通过</el-radio-button>
        <el-radio-button value="rejected">已驳回</el-radio-button>
        <el-radio-button value="withdrawn">已撤回</el-radio-button>
        <el-radio-button value="all">全部</el-radio-button>
      </el-radio-group>
      <div class="page-toolbar__spacer"></div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="list" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名字" width="120" />
      <el-table-column label="类型" width="80">
        <template #default="{ row }">{{ row.type === 'cat' ? '猫' : '狗' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="所在地" min-width="180" />
      <el-table-column prop="contactName" label="投稿人" width="110" />
      <el-table-column label="联系方式" width="150">
        <template #default="{ row }">{{ row.phone || row.wechat || '-' }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="提交时间" width="170" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          <el-button v-if="row.status === 'pending'" link type="success" @click="openApprove(row)">
            通过
          </el-button>
          <el-button v-if="row.status === 'pending'" link type="danger" @click="openReject(row)">
            驳回
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-row">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="size"
        :current-page="page"
        @current-change="onPageChange"
      />
    </div>

    <el-drawer v-model="drawer" title="投稿详情" size="620px">
      <div v-loading="detailLoading">
        <template v-if="detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusType(detail.status)">{{ statusLabel(detail.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="名字">{{ detail.name }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{ detail.type === 'cat' ? '猫' : '狗' }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ detail.gender === 'male' ? '男孩' : '女孩' }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ detail.age }}</el-descriptions-item>
            <el-descriptions-item label="品种">{{ detail.breed || '-' }}</el-descriptions-item>
            <el-descriptions-item label="绝育 / 疫苗">
              {{ detail.sterilized ? '已绝育' : '未绝育' }} / {{ detail.vaccinated ? '已接种' : '未接种' }}
            </el-descriptions-item>
            <el-descriptions-item label="健康状况">{{ detail.health || '-' }}</el-descriptions-item>
            <el-descriptions-item label="所在地">{{ detail.location }}</el-descriptions-item>
            <el-descriptions-item label="投稿人">{{ detail.contactName }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ detail.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="微信号">{{ detail.wechat || '-' }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ detail.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="审核时间">{{ detail.reviewedAt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="动物 ID">{{ detail.animalId || '-' }}</el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">救助故事</el-divider>
          <p style="line-height: 1.8; color: #374151">{{ detail.story }}</p>

          <el-divider content-position="left">照片</el-divider>
          <div class="image-grid">
            <el-image
              v-for="(image, index) in detail.images"
              :key="image"
              :src="image"
              :preview-src-list="detail.images"
              :initial-index="index"
              fit="cover"
            />
          </div>

          <div v-if="detail.rejectReason" style="margin-top: 20px">
            <el-alert
              type="error"
              :title="'驳回原因：' + detail.rejectReason"
              :description="'原因码：' + (detail.rejectCode || '-')"
              show-icon
              :closable="false"
            />
          </div>

          <div v-if="detail.status === 'pending'" class="detail-actions">
            <el-button type="success" @click="openApprove(detail)">审核通过并发布</el-button>
            <el-button type="danger" @click="openReject(detail)">驳回</el-button>
          </div>
        </template>
      </div>
    </el-drawer>

    <el-dialog v-model="approveDialog" title="审核通过并发布" width="640px">
      <el-form :model="approveForm" label-width="90px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="名字">
              <el-input v-model="approveForm.name" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型">
              <el-select v-model="approveForm.type" style="width: 100%">
                <el-option label="猫" value="cat" />
                <el-option label="狗" value="dog" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-select v-model="approveForm.gender" style="width: 100%">
                <el-option label="男孩" value="male" />
                <el-option label="女孩" value="female" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄">
              <el-input v-model="approveForm.age" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品种">
              <el-input v-model="approveForm.breed" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在地">
              <el-input v-model="approveForm.location" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="绝育">
              <el-switch v-model="approveForm.sterilized" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="疫苗">
              <el-switch v-model="approveForm.vaccinated" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="健康状况">
          <el-input v-model="approveForm.health" maxlength="200" />
        </el-form-item>
        <el-form-item label="救助故事">
          <el-input v-model="approveForm.story" type="textarea" :rows="4" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="approveForm.tagsText" placeholder="用逗号分隔，如：亲人, 已绝育" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="approveDialog = false">取消</el-button>
        <el-button type="success" :loading="actionLoading" @click="submitApprove">确认通过</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectDialog" title="驳回投稿" width="520px">
      <el-form :model="rejectForm" label-width="90px">
        <el-form-item label="原因">
          <el-select v-model="rejectForm.reasonCode" style="width: 100%">
            <el-option label="信息不完整" value="info_incomplete" />
            <el-option label="照片不清晰" value="photo_unclear" />
            <el-option label="重复投稿" value="duplicate" />
            <el-option label="疑似家养" value="likely_owned" />
            <el-option label="内容风险" value="content_risk" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="rejectDialog = false">取消</el-button>
        <el-button type="danger" :loading="actionLoading" @click="submitReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  listSubmissions,
  getSubmission,
  approveSubmission,
  rejectSubmission
} from '../api/admin'

const STATUS = {
  pending: { label: '待审核', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
  withdrawn: { label: '已撤回', type: 'info' }
}

const status = ref('pending')
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const drawer = ref(false)
const detail = ref(null)
const detailLoading = ref(false)

const approveDialog = ref(false)
const rejectDialog = ref(false)
const actionLoading = ref(false)

const approveForm = reactive({
  id: '',
  name: '',
  type: 'cat',
  gender: 'female',
  age: '',
  breed: '',
  sterilized: false,
  vaccinated: true,
  health: '',
  location: '',
  story: '',
  tagsText: ''
})

const rejectForm = reactive({
  id: '',
  reasonCode: 'info_incomplete',
  reason: ''
})

function statusLabel(value) {
  return (STATUS[value] && STATUS[value].label) || value
}

function statusType(value) {
  return (STATUS[value] && STATUS[value].type) || 'info'
}

async function load() {
  loading.value = true
  try {
    const data = await listSubmissions({
      status: status.value,
      page: page.value,
      size: size.value
    })
    list.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function reload() {
  page.value = 1
  load()
}

function onPageChange(value) {
  page.value = value
  load()
}

async function openDetail(row) {
  drawer.value = true
  detail.value = row
  detailLoading.value = true
  try {
    detail.value = await getSubmission(row.id)
  } catch (error) {
    ElMessage.error(error.message || '加载详情失败')
  } finally {
    detailLoading.value = false
  }
}

function fillApprove(row) {
  approveForm.id = row.id
  approveForm.name = row.name || ''
  approveForm.type = row.type || 'cat'
  approveForm.gender = row.gender || 'female'
  approveForm.age = row.age || ''
  approveForm.breed = row.breed || ''
  approveForm.sterilized = !!row.sterilized
  approveForm.vaccinated = !!row.vaccinated
  approveForm.health = row.health || ''
  approveForm.location = row.location || ''
  approveForm.story = row.story || ''
  approveForm.tagsText = ''
}

function openApprove(row) {
  fillApprove(row)
  approveDialog.value = true
}

async function submitApprove() {
  actionLoading.value = true
  try {
    const tags = approveForm.tagsText
      .split(/[，,]/)
      .map((item) => item.trim())
      .filter(Boolean)
    const result = await approveSubmission(approveForm.id, {
      name: approveForm.name,
      type: approveForm.type,
      gender: approveForm.gender,
      age: approveForm.age,
      breed: approveForm.breed,
      sterilized: approveForm.sterilized,
      vaccinated: approveForm.vaccinated,
      health: approveForm.health,
      location: approveForm.location,
      story: approveForm.story,
      tags
    })
    ElMessage.success('已通过并生成动物档案 #' + result.animalId)
    approveDialog.value = false
    drawer.value = false
    load()
  } catch (error) {
    ElMessage.error(error.message || '审核失败')
  } finally {
    actionLoading.value = false
  }
}

function openReject(row) {
  rejectForm.id = row.id
  rejectForm.reasonCode = 'info_incomplete'
  rejectForm.reason = ''
  rejectDialog.value = true
}

async function submitReject() {
  actionLoading.value = true
  try {
    await rejectSubmission(rejectForm.id, {
      reasonCode: rejectForm.reasonCode,
      reason: rejectForm.reason
    })
    ElMessage.success('已驳回')
    rejectDialog.value = false
    drawer.value = false
    load()
  } catch (error) {
    ElMessage.error(error.message || '驳回失败')
  } finally {
    actionLoading.value = false
  }
}

onMounted(load)
</script>

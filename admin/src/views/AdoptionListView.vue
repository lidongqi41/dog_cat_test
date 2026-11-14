<template>
  <div class="page-card">
    <div class="page-toolbar">
      <el-radio-group v-model="status" @change="reload">
        <el-radio-button value="pending">待审核</el-radio-button>
        <el-radio-button value="approved">已通过</el-radio-button>
        <el-radio-button value="rejected">已拒绝</el-radio-button>
        <el-radio-button value="withdrawn">已撤销</el-radio-button>
        <el-radio-button value="all">全部</el-radio-button>
      </el-radio-group>
      <div class="page-toolbar__spacer"></div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="list" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="animalName" label="动物" width="120" />
      <el-table-column prop="applicantName" label="申请人" width="110" />
      <el-table-column label="联系方式" width="160">
        <template #default="{ row }">{{ row.phone || row.wechat || '-' }}</template>
      </el-table-column>
      <el-table-column prop="housing" label="居住情况" min-width="180" />
      <el-table-column prop="createdAt" label="提交时间" width="170" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          <el-button v-if="row.status === 'pending'" link type="success" @click="approve(row)">
            通过
          </el-button>
          <el-button v-if="row.status === 'pending'" link type="danger" @click="openReject(row)">
            拒绝
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

    <el-drawer v-model="drawer" title="领养申请详情" size="580px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(detail.status)">{{ statusLabel(detail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="动物">{{ detail.animalName }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ detail.animalType === 'cat' ? '猫' : '狗' }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ detail.applicantName }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detail.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="微信号">{{ detail.wechat || '-' }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ detail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ detail.reviewedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ detail.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="居住情况" :span="2">{{ detail.housing }}</el-descriptions-item>
          <el-descriptions-item label="养宠经验" :span="2">{{ detail.experience || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="detail.status === 'pending'" class="detail-actions">
          <el-button type="success" @click="approve(detail)">通过申请</el-button>
          <el-button type="danger" @click="openReject(detail)">拒绝申请</el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="rejectDialog" title="拒绝领养申请" width="520px">
      <el-form label-width="80px">
        <el-form-item label="原因">
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="会展示给申请人"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialog = false">取消</el-button>
        <el-button type="danger" :loading="actionLoading" @click="submitReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listAdoptions, approveAdoption, rejectAdoption } from '../api/admin'

const STATUS = {
  pending: { label: '待审核', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已拒绝', type: 'danger' },
  withdrawn: { label: '已撤销', type: 'info' }
}

const status = ref('pending')
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const drawer = ref(false)
const detail = ref(null)
const rejectDialog = ref(false)
const rejectReason = ref('')
const rejectId = ref('')
const actionLoading = ref(false)

function statusLabel(value) {
  return (STATUS[value] && STATUS[value].label) || value
}

function statusType(value) {
  return (STATUS[value] && STATUS[value].type) || 'info'
}

async function load() {
  loading.value = true
  try {
    const data = await listAdoptions({
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

function openDetail(row) {
  detail.value = row
  drawer.value = true
}

async function approve(row) {
  try {
    await ElMessageBox.confirm(
      '通过后该动物会标记为「已领养」，确定通过吗？',
      '通过领养申请',
      { type: 'warning', confirmButtonText: '通过', cancelButtonText: '取消' }
    )
  } catch (error) {
    return
  }

  try {
    await approveAdoption(row.id)
    ElMessage.success('已通过')
    drawer.value = false
    load()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

function openReject(row) {
  rejectId.value = row.id
  rejectReason.value = ''
  rejectDialog.value = true
}

async function submitReject() {
  actionLoading.value = true
  try {
    await rejectAdoption(rejectId.value, rejectReason.value)
    ElMessage.success('已拒绝')
    rejectDialog.value = false
    drawer.value = false
    load()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    actionLoading.value = false
  }
}

onMounted(load)
</script>

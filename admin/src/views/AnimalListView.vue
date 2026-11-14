<template>
  <div class="page-card">
    <div class="page-toolbar">
      <el-select v-model="type" style="width: 110px" @change="reload">
        <el-option label="全部类型" value="all" />
        <el-option label="猫" value="cat" />
        <el-option label="狗" value="dog" />
      </el-select>
      <el-select v-model="status" style="width: 130px" @change="reload">
        <el-option label="全部状态" value="all" />
        <el-option label="待领养" value="available" />
        <el-option label="审核中" value="pending" />
        <el-option label="已领养" value="adopted" />
      </el-select>
      <el-input
        v-model="keyword"
        placeholder="搜索名字、品种、地点"
        style="width: 240px"
        clearable
        @keyup.enter="reload"
      />
      <el-button type="primary" @click="reload">搜索</el-button>
      <div class="page-toolbar__spacer"></div>
      <el-button type="success" @click="openCreate">新增动物</el-button>
    </div>

    <el-table v-loading="loading" :data="list" row-key="id">
      <el-table-column label="封面" width="90">
        <template #default="{ row }">
          <el-image v-if="row.cover" class="table-cover" :src="row.cover" fit="cover" />
          <div v-else class="table-cover" style="display: flex; align-items: center; justify-content: center">
            {{ row.type === 'cat' ? '🐱' : '🐶' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="名字" width="110" />
      <el-table-column label="类型" width="70">
        <template #default="{ row }">{{ row.type === 'cat' ? '猫' : '狗' }}</template>
      </el-table-column>
      <el-table-column label="性别" width="70">
        <template #default="{ row }">{{ row.gender === 'male' ? '男孩' : '女孩' }}</template>
      </el-table-column>
      <el-table-column prop="age" label="年龄" width="90" />
      <el-table-column prop="breed" label="品种" width="130" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="所在地" min-width="170" />
      <el-table-column label="来源" width="100">
        <template #default="{ row }">
          <el-tag :type="row.source === 'submission' ? 'success' : 'info'" effect="plain">
            {{ row.source === 'submission' ? '用户投稿' : '官方' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
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

    <el-dialog
      v-model="dialog"
      :title="form.id ? '编辑动物档案' : '新增动物档案'"
      width="720px"
      destroy-on-close
    >
      <el-form :model="form" label-width="90px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="名字" required>
              <el-input v-model="form.name" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" required>
              <el-select v-model="form.type" style="width: 100%">
                <el-option label="猫" value="cat" />
                <el-option label="狗" value="dog" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" required>
              <el-select v-model="form.gender" style="width: 100%">
                <el-option label="男孩" value="male" />
                <el-option label="女孩" value="female" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄" required>
              <el-input v-model="form.age" maxlength="20" placeholder="如：1 岁" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品种">
              <el-input v-model="form.breed" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" required>
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="待领养" value="available" />
                <el-option label="审核中" value="pending" />
                <el-option label="已领养" value="adopted" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="绝育">
              <el-switch v-model="form.sterilized" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="疫苗">
              <el-switch v-model="form.vaccinated" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="所在地" required>
              <el-input v-model="form.location" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="健康状况">
              <el-input v-model="form.health" maxlength="200" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="救助故事">
              <el-input v-model="form.story" type="textarea" :rows="3" maxlength="1000" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="标签">
              <el-input v-model="form.tagsText" placeholder="用逗号分隔，如：亲人, 已绝育" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="照片">
              <div>
                <div class="image-grid" style="margin-bottom: 10px">
                  <div v-for="(image, index) in form.images" :key="image" style="position: relative">
                    <el-image
                      :src="image"
                      :preview-src-list="form.images"
                      :initial-index="index"
                      fit="cover"
                      style="width: 96px; height: 96px; border-radius: 8px"
                    />
                    <el-button
                      circle
                      size="small"
                      type="danger"
                      style="position: absolute; top: -8px; right: -8px"
                      @click="removeImage(index)"
                    >×</el-button>
                  </div>
                </div>
                <el-upload
                  :show-file-list="false"
                  accept="image/*"
                  :http-request="handleUpload"
                  :disabled="form.images.length >= 9"
                >
                  <el-button :disabled="form.images.length >= 9">上传图片</el-button>
                </el-upload>
                <div class="form-tip">最多 9 张，单张不超过 5MB；第一张作为封面。</div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { upload } from '../api/client'
import { listAnimals, createAnimal, updateAnimal, deleteAnimal } from '../api/admin'

const STATUS = {
  available: { label: '待领养', type: 'success' },
  pending: { label: '审核中', type: 'warning' },
  adopted: { label: '已领养', type: 'info' }
}

const type = ref('all')
const status = ref('all')
const keyword = ref('')
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const dialog = ref(false)
const saving = ref(false)
const form = reactive({
  id: null,
  name: '',
  type: 'cat',
  gender: 'female',
  age: '',
  breed: '',
  sterilized: false,
  vaccinated: true,
  health: '',
  location: '',
  status: 'available',
  cover: '',
  images: [],
  story: '',
  tagsText: ''
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
    const data = await listAnimals({
      type: type.value,
      status: status.value,
      keyword: keyword.value,
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

function resetForm() {
  form.id = null
  form.name = ''
  form.type = 'cat'
  form.gender = 'female'
  form.age = ''
  form.breed = ''
  form.sterilized = false
  form.vaccinated = true
  form.health = ''
  form.location = ''
  form.status = 'available'
  form.cover = ''
  form.images = []
  form.story = ''
  form.tagsText = ''
}

function openCreate() {
  resetForm()
  dialog.value = true
}

function openEdit(row) {
  resetForm()
  form.id = row.id
  form.name = row.name || ''
  form.type = row.type || 'cat'
  form.gender = row.gender || 'female'
  form.age = row.age || ''
  form.breed = row.breed || ''
  form.sterilized = !!row.sterilized
  form.vaccinated = !!row.vaccinated
  form.health = row.health || ''
  form.location = row.location || ''
  form.status = row.status || 'available'
  form.cover = row.cover || ''
  form.images = (row.images || []).slice()
  form.story = row.story || ''
  form.tagsText = (row.tags || []).join(', ')
  dialog.value = true
}

async function handleUpload(options) {
  try {
    const data = await upload(options.file, 'animal')
    form.images.push(data.url)
    options.onSuccess(data)
    ElMessage.success('上传成功')
  } catch (error) {
    options.onError(error)
    ElMessage.error(error.message || '上传失败')
  }
}

function removeImage(index) {
  form.images.splice(index, 1)
}

async function save() {
  if (!form.name.trim() || !form.age.trim() || !form.location.trim()) {
    ElMessage.warning('名字、年龄、所在地不能为空')
    return
  }

  const tags = form.tagsText
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean)

  const body = {
    name: form.name.trim(),
    type: form.type,
    gender: form.gender,
    age: form.age.trim(),
    breed: form.breed.trim(),
    sterilized: form.sterilized,
    vaccinated: form.vaccinated,
    health: form.health.trim(),
    location: form.location.trim(),
    status: form.status,
    cover: form.images[0] || form.cover || '',
    images: form.images,
    story: form.story.trim(),
    tags
  }

  saving.value = true
  try {
    if (form.id) {
      await updateAnimal(form.id, body)
      ElMessage.success('已保存')
    } else {
      await createAnimal(body)
      ElMessage.success('已新增')
    }
    dialog.value = false
    load()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function remove(row) {
  try {
    await ElMessageBox.confirm('删除后动物档案不可恢复，确定删除吗？', '删除动物', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
  } catch (error) {
    return
  }

  try {
    await deleteAnimal(row.id)
    ElMessage.success('已删除')
    load()
  } catch (error) {
    ElMessage.error(error.message || '删除失败')
  }
}

onMounted(load)
</script>

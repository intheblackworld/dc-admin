<template>
  <div class="announcement-view">
    <div class="page-header">
      <h1>公告管理</h1>
      <div class="breadcrumb"><span>首頁</span> / <span>公告管理</span></div>
    </div>

    <!-- 搜尋區域 -->
    <n-card class="search-card">
      <div class="search-area">
        <div class="search-item">
          <span class="label">公告標題:</span>
          <n-input v-model:value="searchParams.title" placeholder="請輸入公告標題" clearable />
        </div>

        <div class="search-item">
          <span class="label">公告分類:</span>
          <n-select
            v-model:value="searchParams.category"
            :options="categoryOptions"
            placeholder="請選擇分類"
            clearable
          />
        </div>

        <div class="search-item">
          <span class="label">時間類型:</span>
          <n-select
            v-model:value="searchParams.date_type"
            :options="dateTypeOptions"
            placeholder="請選擇時間類型"
            clearable
          />
        </div>

        <div class="search-item">
          <span class="label">每頁顯示:</span>
          <n-select
            v-model:value="searchParams.page_limit"
            :options="pageLimitOptions"
            placeholder="請選擇每頁顯示數量"
          />
        </div>

        <n-button type="primary" @click="search">搜尋</n-button>
        <n-button @click="resetSearch">清除搜尋</n-button>
        <n-button type="info" @click="openCreateModal">新增公告</n-button>
      </div>
    </n-card>

    <!-- 資料列表 -->
    <n-card class="data-card">
      <n-data-table
        :columns="columns"
        :data="announcementList"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
      />
    </n-card>

    <!-- 詳情彈窗 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="公告詳情"
      style="width: 600px; max-width: 90%"
    >
      <n-descriptions :column="1" bordered>
        <n-descriptions-item label="公告標題">
          {{ currentAnnouncement.title }}
        </n-descriptions-item>
        <n-descriptions-item label="公告分類">
          {{ getCategoryLabel(currentAnnouncement.category.toString()) }}
        </n-descriptions-item>
        <n-descriptions-item label="時間類型">
          {{ getDateTypeLabel(currentAnnouncement.date_type) }}
        </n-descriptions-item>
        <n-descriptions-item label="開始時間">
          {{ currentAnnouncement.start_time }}
        </n-descriptions-item>
        <n-descriptions-item label="結束時間">
          {{ currentAnnouncement.end_time }}
        </n-descriptions-item>
        <n-descriptions-item label="創建者">
          {{ currentAnnouncement.admin_name }}
        </n-descriptions-item>
        <n-descriptions-item label="創建時間">
          {{ currentAnnouncement.created_at }}
        </n-descriptions-item>
        <n-descriptions-item label="更新時間">
          {{ currentAnnouncement.updated_at }}
        </n-descriptions-item>
        <n-descriptions-item label="公告內容">
          <div class="announcement-content" v-html="currentAnnouncement.content"></div>
        </n-descriptions-item>
      </n-descriptions>
      <div class="action-buttons">
        <n-button @click="showDetailModal = false">關閉</n-button>
        <n-button type="primary" @click="openEditModal">編輯</n-button>
      </div>
    </n-modal>

    <!-- 創建/編輯公告彈窗 -->
    <n-modal
      v-model:show="showForm"
      preset="card"
      :title="isEdit ? '編輯公告' : '新增公告'"
      style="width: 700px; max-width: 90%"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100px"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="公告標題" path="title">
          <n-input v-model:value="formData.title" placeholder="請輸入公告標題" />
        </n-form-item>

        <n-form-item label="公告分類" path="category">
          <n-select
            v-model:value="formData.category"
            :options="categoryOptions"
            placeholder="請選擇分類"
          />
        </n-form-item>

        <n-form-item label="時間類型" path="date_type">
          <n-select
            v-model:value="formData.date_type"
            :options="dateTypeOptions"
            placeholder="請選擇時間類型"
          />
        </n-form-item>

        <n-form-item label="開始時間" path="start_time">
          <n-date-picker
            v-model:value="formData.start_time"
            type="datetime"
            clearable
            style="width: 100%"
            value-format="timestamp"
            @update:value="(value) => console.log('開始時間更新:', value)"
          />
        </n-form-item>

        <n-form-item label="結束時間" path="end_time">
          <n-date-picker
            v-model:value="formData.end_time"
            type="datetime"
            clearable
            style="width: 100%"
            value-format="timestamp"
            @update:value="(value) => console.log('結束時間更新:', value)"
          />
        </n-form-item>

        <n-form-item label="公告內容" path="content">
          <n-input
            v-model:value="formData.content"
            type="textarea"
            placeholder="請輸入公告內容"
            :autosize="{ minRows: 5, maxRows: 10 }"
          />
        </n-form-item>
      </n-form>

      <div class="action-buttons">
        <n-button @click="showForm = false">取消</n-button>
        <n-button type="primary" @click="submitForm">確定</n-button>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, ref, reactive, onMounted, watch } from 'vue'
import {
  NCard,
  NInput,
  NButton,
  NSelect,
  NDataTable,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  useMessage,
  NForm,
  NFormItem,
  NDatePicker,
  NSwitch,
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import type { Announcement } from '@/lib/api'
import {
  getAnnouncementList,
  getAnnouncementDetail,
  createAnnouncement,
  updateAnnouncement,
  toggleAnnouncementStatus,
} from '@/lib/api'

// 消息提示
const message = useMessage()

// 表單引用
const formRef = ref<FormInst | null>(null)

// 載入狀態
const loading = ref(false)

// 公告列表數據
const announcementList = ref<Announcement[]>([])

// 當前選中的公告
const currentAnnouncement = ref<Announcement>({} as Announcement)

// 彈窗控制
const showDetailModal = ref(false)
const showForm = ref(false)
const isEdit = ref(false)

// 分頁設置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 50],
  onChange: (page: number) => {
    pagination.page = page
    loadData()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    searchParams.page_limit = pageSize
    loadData()
  },
})

// 搜尋參數
const searchParams = reactive({
  title: '',
  category: null as number | null,
  date_type: null as string | null,
  page: 1,
  page_limit: 10,
})

// 監聽分頁大小變化
watch(
  () => searchParams.page_limit,
  (newValue) => {
    pagination.pageSize = newValue
    pagination.page = 1
    loadData()
  },
)

// 表單數據
const formData = reactive({
  id: '',
  title: '',
  content: '',
  category: '1',
  date_type: 'forever',
  start_time: null as number | null,
  end_time: null as number | null,
})

// 表單驗證規則
const rules = {
  title: {
    required: true,
    message: '請輸入公告標題',
    trigger: 'blur',
  },
  category: {
    required: true,
    message: '請選擇公告分類',
    trigger: 'change',
  },
  date_type: {
    required: true,
    message: '請選擇時間類型',
    trigger: 'change',
  },
  start_time: {
    required: true,
    type: 'number',
    message: '請選擇開始時間',
    trigger: ['change', 'blur'],
    validator: (rule: unknown, value: number | null) => {
      console.log('驗證開始時間:', value)
      return !!value
    },
  },
  end_time: {
    required: true,
    type: 'number',
    message: '請選擇結束時間',
    trigger: ['change', 'blur'],
    validator: (rule: unknown, value: number | null) => {
      console.log('驗證結束時間:', value)
      return !!value
    },
  },
  content: {
    required: true,
    message: '請輸入公告內容',
    trigger: 'blur',
  },
} as FormRules

// 選項列表
const categoryOptions = [
  {
    label: '網站公告',
    value: '1',
  },
  {
    label: '遊戲維護',
    value: '2',
  },
  {
    label: '銀行維護',
    value: '3',
  },
]

const dateTypeOptions = [
  {
    label: '永久',
    value: 'forever',
  },
  {
    label: '時間區間',
    value: 'range',
  },
]

const pageLimitOptions = [
  {
    label: '10條/頁',
    value: 10,
  },
  {
    label: '20條/頁',
    value: 20,
  },
  {
    label: '30條/頁',
    value: 30,
  },
  {
    label: '50條/頁',
    value: 50,
  },
]

// 啟用/停用按鈕的載入狀態
const loadingStatus = reactive<Record<string, boolean>>({})

// 初始化加載數據
onMounted(() => {
  loadData()
})

// 表格列定義
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '公告標題',
    key: 'title',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '公告分類',
    key: 'category',
    width: 100,
    render(row: Announcement) {
      return getCategoryLabel(row.category.toString())
    },
  },
  {
    title: '時間類型',
    key: 'date_type',
    width: 100,
    render(row: Announcement) {
      return getDateTypeLabel(row.date_type)
    },
  },
  {
    title: '創建時間',
    key: 'created_at',
    width: 160,
  },
  {
    title: '創建者',
    key: 'admin_name',
    width: 120,
  },
  {
    title: '狀態',
    key: 'status',
    width: 100,
    render(row: Announcement) {
      // 根據行數據中的 status 來確定顏色
      console.log('狀態:', row.status)
      const switchColor = row.status == '1' ? '#18a058' : '#d03050'

      // 建立一個額外的標籤來顯示狀態文字
      const statusLabel = h(
        'span',
        {
          style: {
            marginLeft: '8px',
            color: switchColor,
          },
        },
        row.status === '1' ? '啟用中' : '已停用',
      )

      return h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
          },
        },
        [
          h(NSwitch, {
            value: row.status === '1',
            loading: loadingStatus[row.id] === true,
            onUpdateValue: (value: boolean) => {
              handleStatusChange(row.id, value ? '1' : '0')
            },
            railStyle: () => {
              return { background: switchColor }
            },
          }),
          statusLabel,
        ],
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row: Announcement) {
      return h('div', { class: 'table-actions' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            ghost: true,
            onClick: () => viewDetail(row.id),
          },
          { default: () => '詳情' },
        ),
      ])
    },
  },
]

// 加載公告列表數據
async function loadData() {
  loading.value = true
  try {
    const title = searchParams.title || undefined
    const category = searchParams.category !== null ? Number(searchParams.category) : undefined
    const date_type = searchParams.date_type || undefined

    const response = await getAnnouncementList(
      pagination.page,
      pagination.pageSize,
      title,
      category,
      date_type,
    )

    if (response.status === 0) {
      announcementList.value = response.data.list
      pagination.itemCount = response.data.total
    } else {
      message.error(response.message || '獲取公告列表失敗')
    }
  } catch (error) {
    message.error('獲取公告列表時發生錯誤')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 搜尋功能
function search() {
  pagination.page = 1
  loadData()
}

// 重置搜尋
function resetSearch() {
  searchParams.title = ''
  searchParams.category = null
  searchParams.date_type = null
  pagination.page = 1
  loadData()
}

// 頁碼變更處理
function handlePageChange(page: number) {
  pagination.page = page
  loadData()
}

// 獲取公告詳情
async function viewDetail(id: string) {
  try {
    const response = await getAnnouncementDetail(id)
    if (response.status === 0) {
      currentAnnouncement.value = response.data
      showDetailModal.value = true
    } else {
      message.error(response.message || '獲取公告詳情失敗')
    }
  } catch (error) {
    message.error('獲取公告詳情時發生錯誤')
    console.error(error)
  }
}

// 處理啟用/停用狀態變更
async function handleStatusChange(id: string, status: string) {
  console.log(`切換公告狀態: ID=${id}, 新狀態=${status}`)
  // 設置加載狀態
  loadingStatus[id] = true

  try {
    const response = await toggleAnnouncementStatus(id, status)
    if (response.status === 0) {
      message.success(status === '1' ? '啟用成功' : '停用成功')
      // 更新本地數據，避免重新加載整個列表
      const targetIndex = announcementList.value.findIndex((item) => item.id === id)
      if (targetIndex !== -1) {
        announcementList.value[targetIndex].status = status
      } else {
        // 如果找不到對應記錄，才重新加載整個列表
        loadData()
      }
    } else {
      message.error(response.message || '操作失敗')
      // 操作失敗時重新加載數據以還原狀態
      loadData()
    }
  } catch (error) {
    console.error('切換公告狀態發生錯誤:', error)
    message.error('操作時發生錯誤')
    // 發生錯誤時重新加載數據以還原狀態
    loadData()
  } finally {
    // 清除加載狀態
    loadingStatus[id] = false
  }
}

// 打開創建模態框
function openCreateModal() {
  isEdit.value = false
  resetForm()
  showForm.value = true
}

// 打開編輯模態框
function openEditModal() {
  isEdit.value = true
  // 複製當前公告數據到表單
  formData.id = currentAnnouncement.value.id
  formData.title = currentAnnouncement.value.title
  formData.content = currentAnnouncement.value.content
  formData.category = currentAnnouncement.value.category.toString()
  formData.date_type = currentAnnouncement.value.date_type

  // 將時間字符串轉換為時間戳
  if (
    currentAnnouncement.value.start_time &&
    currentAnnouncement.value.start_time !== '0000-00-00 00:00:00'
  ) {
    formData.start_time = new Date(currentAnnouncement.value.start_time).getTime()
    console.log('設置開始時間:', formData.start_time)
  } else {
    formData.start_time = null
  }

  if (
    currentAnnouncement.value.end_time &&
    currentAnnouncement.value.end_time !== '0000-00-00 00:00:00'
  ) {
    formData.end_time = new Date(currentAnnouncement.value.end_time).getTime()
    console.log('設置結束時間:', formData.end_time)
  } else {
    formData.end_time = null
  }

  showDetailModal.value = false
  showForm.value = true

  // 確保表單驗證狀態重置
  setTimeout(() => {
    formRef.value?.validate()
  }, 100)
}

// 重置表單
function resetForm() {
  formData.id = ''
  formData.title = ''
  formData.content = ''
  formData.category = '1'
  formData.date_type = 'forever'
  formData.start_time = null
  formData.end_time = null

  // 手動重置表單驗證狀態
  formRef.value?.restoreValidation()
}

// 提交表單
function submitForm() {
  console.log('提交表單時的數據:', formData)
  console.log('開始時間:', formData.start_time, typeof formData.start_time)
  console.log('結束時間:', formData.end_time, typeof formData.end_time)

  formRef.value?.validate(async (errors) => {
    console.log('表單驗證結果:', errors)
    if (!errors) {
      // 準備時間參數
      let start_time = ''
      let end_time = ''

      if (formData.start_time) {
        start_time = formatDateTime(new Date(formData.start_time))
      } else {
        message.error('請選擇開始時間')
        return
      }

      if (formData.end_time) {
        end_time = formatDateTime(new Date(formData.end_time))
      } else {
        message.error('請選擇結束時間')
        return
      }

      console.log('格式化後的時間:', start_time, end_time)

      try {
        if (isEdit.value) {
          // 更新公告
          const id = parseInt(formData.id)
          const response = await updateAnnouncement(
            id,
            formData.title,
            formData.content,
            formData.category,
            formData.date_type,
            start_time,
            end_time,
          )
          if (response.status === 0) {
            message.success('更新公告成功')
            showForm.value = false
            loadData()
          } else {
            message.error(response.message || '更新公告失敗')
          }
        } else {
          // 創建公告
          const response = await createAnnouncement(
            formData.title,
            formData.content,
            formData.category,
            formData.date_type,
            start_time,
            end_time,
          )
          if (response.status === 0) {
            message.success('創建公告成功')
            showForm.value = false
            loadData()
          } else {
            message.error(response.message || '創建公告失敗')
          }
        }
      } catch (error) {
        message.error('操作時發生錯誤')
        console.error(error)
      }
    }
  })
}

// 格式化日期時間
function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 獲取分類標籤
function getCategoryLabel(category: string): string {
  const found = categoryOptions.find((option) => option.value === category)
  return found ? found.label : '未知'
}

// 獲取時間類型標籤
function getDateTypeLabel(dateType: string): string {
  const found = dateTypeOptions.find((option) => option.value === dateType)
  return found ? found.label : '未知'
}
</script>

<style scoped>
.announcement-view {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.breadcrumb {
  color: #888;
  font-size: 14px;
}

.search-card {
  margin-bottom: 20px;
}

.search-area {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.search-item {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.label {
  margin-bottom: 8px;
  font-size: 14px;
}

.data-card {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.announcement-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  white-space: pre-wrap;
}
</style>

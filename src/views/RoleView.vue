<template>
  <div class="role-view">
    <div class="page-header">
      <h1>角色管理</h1>
      <div class="breadcrumb"><span>首頁</span> / <span>角色管理</span></div>
    </div>

    <!-- 搜尋區域 -->
    <n-card class="search-card">
      <div class="search-area">
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
        <n-button type="info" @click="openCreateModal">新增角色</n-button>
      </div>
    </n-card>

    <!-- 資料列表 -->
    <n-card class="data-card">
      <n-data-table
        :columns="columns"
        :data="roleList"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
      />
    </n-card>

    <!-- 詳情彈窗 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="角色詳情"
      style="width: 500px; max-width: 90%"
    >
      <n-descriptions :column="1" bordered>
        <n-descriptions-item label="角色ID">
          {{ currentRole.id }}
        </n-descriptions-item>
        <n-descriptions-item label="角色名稱">
          {{ currentRole.name }}
        </n-descriptions-item>
        <n-descriptions-item label="角色描述">
          {{ currentRole.description || '無' }}
        </n-descriptions-item>
        <n-descriptions-item label="角色狀態">
          {{ currentRole.status === '1' ? '啟用' : '禁用' }}
        </n-descriptions-item>
        <n-descriptions-item v-if="currentRole.created_at" label="創建時間">
          {{ currentRole.created_at }}
        </n-descriptions-item>
        <n-descriptions-item v-if="currentRole.updated_at" label="更新時間">
          {{ currentRole.updated_at }}
        </n-descriptions-item>
      </n-descriptions>
      <div class="action-buttons">
        <n-button @click="showDetailModal = false">關閉</n-button>
        <n-button type="primary" @click="openEditModal">編輯</n-button>
      </div>
    </n-modal>

    <!-- 創建/編輯角色彈窗 -->
    <n-modal
      v-model:show="showForm"
      preset="card"
      :title="isEdit ? '編輯角色' : '新增角色'"
      style="width: 500px; max-width: 90%"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100px"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="角色名稱" path="name">
          <n-input v-model:value="formData.name" placeholder="請輸入角色名稱" />
        </n-form-item>

        <n-form-item label="角色描述" path="description">
          <n-input
            v-model:value="formData.description"
            type="textarea"
            placeholder="請輸入角色描述"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>

        <n-form-item label="角色狀態" path="status">
          <n-select
            v-model:value="formData.status"
            :options="statusOptions"
            placeholder="請選擇狀態"
          />
        </n-form-item>
      </n-form>

      <div class="action-buttons">
        <n-button @click="showForm = false">取消</n-button>
        <n-button type="primary" @click="submitForm">確定</n-button>
      </div>
    </n-modal>

    <!-- 確認刪除彈窗 -->
    <n-modal
      v-model:show="showDeleteConfirm"
      preset="dialog"
      title="確認刪除"
      content="確定要刪除此角色嗎？此操作無法撤銷。"
      positive-text="確定"
      negative-text="取消"
      @positive-click="confirmDelete"
      @negative-click="cancelDelete"
    />
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
  NSwitch,
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import type { Role } from '@/lib/api'
import { getRoleList, getRoleDetail, createRole, updateRole, deleteRole } from '@/lib/api'

// 消息提示
const message = useMessage()

// 表單引用
const formRef = ref<FormInst | null>(null)

// 載入狀態
const loading = ref(false)

// 角色列表數據
const roleList = ref<Role[]>([])

// 當前選中的角色
const currentRole = ref<Role>({} as Role)

// 彈窗控制
const showDetailModal = ref(false)
const showForm = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)

// 要刪除的角色ID
const roleIdToDelete = ref('')

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
  name: '',
  status: null as string | null,
  page: 1,
  page_limit: 10,
})

// 表單數據
const formData = reactive({
  id: '',
  name: '',
  description: '',
  status: '1',
})

// 表單驗證規則
const rules = {
  name: {
    required: true,
    message: '請輸入角色名稱',
    trigger: 'blur',
  },
  status: {
    required: true,
    message: '請選擇角色狀態',
    trigger: 'change',
  },
} as FormRules

// 選項列表
const statusOptions = [
  {
    label: '啟用',
    value: '1',
  },
  {
    label: '禁用',
    value: '2',
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

// 啟用/禁用按鈕的載入狀態
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
    width: 100,
  },
  {
    title: '角色名稱',
    key: 'name',
    width: 150,
  },
  {
    title: '角色描述',
    key: 'description',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '狀態',
    key: 'status',
    width: 120,
    render(row: Role) {
      // 根據行數據中的 status 來確定顏色
      const switchColor = row.status === '1' ? '#18a058' : '#d03050'

      // 建立一個額外的標籤來顯示狀態文字
      const statusLabel = h(
        'span',
        {
          style: {
            marginLeft: '8px',
            color: switchColor,
          },
        },
        row.status === '1' ? '啟用' : '禁用',
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
              handleStatusChange(row.id, value ? '1' : '2')
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
    width: 200,
    render(row: Role) {
      return h('div', { class: 'table-actions' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            ghost: true,
            style: 'margin-right: 8px',
            onClick: () => viewDetail(row.id),
          },
          { default: () => '詳情' },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            ghost: true,
            onClick: () => promptDeleteRole(row.id),
          },
          { default: () => '刪除' },
        ),
      ])
    },
  },
]

// 加載角色列表數據
async function loadData() {
  loading.value = true
  try {
    const params: {
      page: number
      page_limit: number
      name?: string
      status?: string
    } = {
      page: pagination.page,
      page_limit: pagination.pageSize,
    }

    if (searchParams.name) {
      params.name = searchParams.name
    }

    if (searchParams.status) {
      params.status = searchParams.status
    }

    const response = await getRoleList(params.page, params.page_limit)

    if (response.status === 0) {
      roleList.value = response.data.list
      pagination.itemCount = response.data.total
    } else {
      message.error(response.message || '獲取角色列表失敗')
    }
  } catch (error) {
    message.error('獲取角色列表時發生錯誤')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 監聽分頁大小變化
watch(
  () => searchParams.page_limit,
  (newValue) => {
    pagination.pageSize = newValue
    pagination.page = 1
    loadData()
  },
)

// 搜尋功能
function search() {
  pagination.page = 1
  loadData()
}

// 重置搜尋
function resetSearch() {
  searchParams.name = ''
  searchParams.status = null
  pagination.page = 1
  loadData()
  message.info('已清除搜尋條件')
}

// 頁碼變更處理
function handlePageChange(page: number) {
  pagination.page = page
  loadData()
}

// 獲取角色詳情
async function viewDetail(id: string) {
  try {
    const response = await getRoleDetail(id)
    if (response.status === 0) {
      currentRole.value = response.data
      showDetailModal.value = true
    } else {
      message.error(response.message || '獲取角色詳情失敗')
    }
  } catch (error) {
    message.error('獲取角色詳情時發生錯誤')
    console.error(error)
  }
}

// 處理啟用/禁用狀態變更
async function handleStatusChange(id: string, status: string) {
  // 設置加載狀態
  loadingStatus[id] = true

  try {
    const response = await updateRole(id, '', '', status)
    if (response.status === 0) {
      message.success(status === '1' ? '啟用成功' : '禁用成功')
      // 更新本地數據，避免重新加載整個列表
      const targetIndex = roleList.value.findIndex((item) => item.id === id)
      if (targetIndex !== -1) {
        roleList.value[targetIndex].status = status
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
    console.error('切換角色狀態發生錯誤:', error)
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
  // 複製當前角色數據到表單
  formData.id = currentRole.value.id
  formData.name = currentRole.value.name
  formData.description = currentRole.value.description || ''
  formData.status = currentRole.value.status

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
  formData.name = ''
  formData.description = ''
  formData.status = '1'

  // 手動重置表單驗證狀態
  formRef.value?.restoreValidation()
}

// 提交表單
function submitForm() {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        if (isEdit.value) {
          // 更新角色
          const response = await updateRole(
            formData.id,
            formData.name,
            formData.description,
            formData.status,
          )
          if (response.status === 0) {
            message.success('更新角色成功')
            showForm.value = false
            loadData()
          } else {
            message.error(response.message || '更新角色失敗')
          }
        } else {
          // 創建角色
          const response = await createRole(formData.name, formData.description, formData.status)
          if (response.status === 0) {
            message.success('創建角色成功')
            showForm.value = false
            loadData()
          } else {
            message.error(response.message || '創建角色失敗')
          }
        }
      } catch (error) {
        message.error('操作時發生錯誤')
        console.error(error)
      }
    }
  })
}

// 彈出刪除確認框
function promptDeleteRole(id: string) {
  roleIdToDelete.value = id
  showDeleteConfirm.value = true
}

// 確認刪除
async function confirmDelete() {
  try {
    const response = await deleteRole(roleIdToDelete.value)
    if (response.status === 0) {
      message.success('刪除角色成功')
      loadData()
    } else {
      message.error(response.message || '刪除角色失敗')
    }
  } catch (error) {
    message.error('刪除角色時發生錯誤')
    console.error(error)
  } finally {
    showDeleteConfirm.value = false
    roleIdToDelete.value = ''
  }
}

// 取消刪除
function cancelDelete() {
  showDeleteConfirm.value = false
  roleIdToDelete.value = ''
}
</script>

<style scoped>
.role-view {
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
</style>

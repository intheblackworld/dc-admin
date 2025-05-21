<template>
  <div class="admin-account-page">
    <div class="page-header">
      <h1>管理員帳號</h1>
      <div class="page-tools">
        <div class="page-breadcrumb">會員管理>管理員帳號</div>
      </div>
    </div>

    <!-- 搜尋區域 -->
    <n-card class="search-area">
      <n-grid :cols="24" :x-gap="12" :y-gap="16">
        <!-- 第一列 -->
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">帳號狀態</div>
            <n-select
              v-model:value="searchParams.status"
              :options="statusOptions"
              placeholder="請選擇"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">帳號名稱</div>
            <n-input
              v-model:value="searchParams.account_name"
              placeholder="請輸入帳號名稱"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">角色</div>
            <n-select
              v-model:value="searchParams.role_id"
              :options="roleOptions"
              placeholder="請選擇角色"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">每頁顯示</div>
            <n-select
              v-model:value="searchParams.page_limit"
              :options="pageLimitOptions"
              placeholder="請選擇每頁數量"
            />
          </div>
        </n-grid-item>

        <!-- 第二列 -->
        <n-grid-item :span="24">
          <div class="search-buttons">
            <n-button type="primary" @click="handleSearch">搜尋</n-button>
            <n-button @click="clearSearch">清除查詢</n-button>
            <n-button type="info" @click="openCreateModal">新增管理員</n-button>
          </div>
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 表格區域 -->
    <n-card class="data-table-area">
      <n-data-table
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        :bordered="false"
        :loading="loading"
        size="small"
        :row-class-name="rowClassName"
        stripe
      />
    </n-card>

    <!-- 創建/編輯管理員彈窗 -->
    <n-modal
      v-model:show="showForm"
      preset="card"
      :title="isEdit ? '編輯管理員' : '新增管理員'"
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
        <n-form-item label="帳號名稱" path="account_name">
          <n-input
            v-model:value="formData.account_name"
            placeholder="請輸入帳號名稱"
            :disabled="isEdit"
          />
        </n-form-item>

        <n-form-item label="密碼" path="password" :required="!isEdit">
          <n-input
            v-model:value="formData.password"
            type="password"
            :placeholder="isEdit ? '不修改請留空' : '請輸入密碼'"
          />
        </n-form-item>

        <n-form-item label="角色" path="role_id">
          <n-select
            v-model:value="formData.role_id"
            :options="roleOptions"
            placeholder="請選擇角色"
          />
        </n-form-item>

        <n-form-item v-if="isEdit" label="帳號狀態" path="status">
          <n-select
            v-model:value="formData.status"
            :options="statusOptions"
            placeholder="請選擇狀態"
          />
        </n-form-item>
      </n-form>

      <div class="action-buttons">
        <n-button @click="showForm = false">取消</n-button>
        <n-button type="primary" @click="submitForm" :loading="submitting">確定</n-button>
      </div>
    </n-modal>

    <!-- Google 驗證設置彈窗 -->
    <n-modal
      v-model:show="showGoogleAuthModal"
      preset="dialog"
      :title="currentAdmin.google_status === '1' ? '關閉 Google 驗證' : '開啟 Google 驗證'"
      :content="
        currentAdmin.google_status === '1'
          ? '確定要關閉此管理員的 Google 驗證嗎？'
          : '確定要開啟此管理員的 Google 驗證嗎？'
      "
      positive-text="確定"
      negative-text="取消"
      @positive-click="confirmToggleGoogleAuth"
      @negative-click="cancelToggleGoogleAuth"
    />

    <!-- 確認刪除彈窗 -->
    <n-modal
      v-model:show="showDeleteConfirm"
      preset="dialog"
      title="確認刪除"
      content="確定要刪除此管理員帳號嗎？此操作無法撤銷。"
      positive-text="確定"
      negative-text="取消"
      @positive-click="confirmDelete"
      @negative-click="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { h, ref, reactive, onMounted, watch } from 'vue'
import { NSwitch, NButton, NSpace, useMessage, NForm, NFormItem, NModal } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import {
  getAdminList,
  toggleAdminStatus,
  createAdmin,
  updateAdmin,
  toggleAdminGoogleAuth,
  getRoleList,
  type Admin as BaseAdmin,
  type Role,
} from '@/lib/api'

// 擴展 Admin 類型以包含 google_status
interface Admin extends BaseAdmin {
  google_status?: string
}

const message = useMessage()

// 表單引用
const formRef = ref<FormInst | null>(null)

// 載入狀態
const loading = ref(false)
const submitting = ref(false)

// 管理員列表數據
const tableData = ref<Admin[]>([])
const roleList = ref<Role[]>([])

// 當前選中的管理員
const currentAdmin = ref<Admin>({
  id: '',
  account_name: '',
  role_id: '',
  status: '',
  is_test: '',
  create_time: '',
  update_time: '',
  google_status: '0',
})

// 彈窗控制
const showForm = ref(false)
const showGoogleAuthModal = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)

// 要操作的管理員ID
const adminIdToDelete = ref('')

// 啟用/停用按鈕的載入狀態
const loadingStatus = reactive<Record<string, boolean>>({})
// Google 驗證啟用/停用按鈕的載入狀態
const loadingGoogleStatus = reactive<Record<string, boolean>>({})

// 分頁相關
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 50],
  onChange: (page: number) => {
    pagination.page = page
    loadTableData()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    searchParams.page_limit = pageSize
    loadTableData()
  },
})

// 搜尋參數
const searchParams = reactive({
  page: 1,
  page_limit: 10,
  account_name: '',
  role_id: null as string | null,
  status: null as string | null,
})

// 表單數據
const formData = reactive({
  id: '',
  account_name: '',
  password: '',
  role_id: '',
  status: '1',
})

// 表單驗證規則
const rules = reactive({
  account_name: {
    required: true,
    message: '請輸入帳號名稱',
    trigger: 'blur',
  },
  role_id: {
    required: true,
    message: '請選擇角色',
    trigger: 'change',
  },
  status: {
    required: true,
    message: '請選擇帳號狀態',
    trigger: 'change',
  },
}) as FormRules

// 選項列表
const statusOptions = [
  { label: '啟用', value: '1' },
  { label: '禁用', value: '0' },
]

const pageLimitOptions = [
  { label: '10條/頁', value: 10 },
  { label: '20條/頁', value: 20 },
  { label: '30條/頁', value: 30 },
  { label: '50條/頁', value: 50 },
]

// 角色選項會動態加載
const roleOptions = ref<{ label: string; value: string }[]>([])

// 初始化加載數據
onMounted(async () => {
  // 加載角色列表
  await loadRoleList()
  // 加載管理員列表
  loadTableData()
})

// 加載角色列表
async function loadRoleList() {
  try {
    const response = await getRoleList(1, 100) // 獲取所有角色
    if (response.status === 0) {
      roleList.value = response.data.list
      // 轉換為下拉框選項格式
      roleOptions.value = response.data.list.map((role: Role) => ({
        label: role.name,
        value: role.id,
      }))
    } else {
      message.error(response.message || '獲取角色列表失敗')
    }
  } catch (error) {
    console.error('加載角色列表失敗:', error)
    message.error('獲取角色列表時發生錯誤')
  }
}

// 表格列定義
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '帳號名稱',
    key: 'account_name',
    width: 150,
  },
  {
    title: '角色',
    key: 'role_id',
    width: 150,
    render(row: Admin) {
      const role = roleList.value.find((r) => r.id === row.role_id)
      return role ? role.name : row.role_id
    },
  },
  {
    title: '創建時間',
    key: 'create_time',
    width: 180,
  },
  {
    title: '更新時間',
    key: 'update_time',
    width: 180,
  },
  {
    title: '帳號狀態',
    key: 'status',
    width: 120,
    render(row: Admin) {
      const statusText = row.status === '1' ? '啟用' : '禁用'
      const statusColor = row.status === '1' ? '#18a058' : '#d03050'

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
              return { background: row.status === '1' ? '#18a058' : '#d03050' }
            },
          }),
          h(
            'span',
            {
              style: {
                marginLeft: '8px',
                color: statusColor,
              },
            },
            statusText,
          ),
        ],
      )
    },
  },
  {
    title: 'Google 驗證',
    key: 'google_status',
    width: 120,
    render(row: Admin & { google_status?: string }) {
      const googleStatus = row.google_status || '0'
      const statusText = googleStatus === '1' ? '已開啟' : '已關閉'
      const statusColor = googleStatus === '1' ? '#18a058' : '#d03050'

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
            value: googleStatus === '1',
            loading: loadingGoogleStatus[row.id] === true,
            onUpdateValue: () => {
              handleGoogleAuthChange(row)
            },
            railStyle: () => {
              return { background: googleStatus === '1' ? '#18a058' : '#d03050' }
            },
          }),
          h(
            'span',
            {
              style: {
                marginLeft: '8px',
                color: statusColor,
              },
            },
            statusText,
          ),
        ],
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render(row: Admin) {
      return h(
        NSpace,
        { justify: 'center', align: 'center' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                ghost: true,
                onClick: () => handleEdit(row),
              },
              { default: () => '編輯' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                ghost: true,
                onClick: () => promptDeleteAdmin(row.id),
              },
              { default: () => '刪除' },
            ),
          ],
        },
      )
    },
  },
]

// 加載表格數據
async function loadTableData() {
  loading.value = true
  try {
    // 準備請求參數，過濾掉空值
    const params = {
      page: searchParams.page,
      page_limit: searchParams.page_limit,
      ...(searchParams.account_name && { account_name: searchParams.account_name }),
      ...(searchParams.role_id && { role_id: searchParams.role_id }),
      ...(searchParams.status !== null && { status: searchParams.status }),
    }

    const response = await getAdminList(params)

    if (response.status === 0) {
      tableData.value = response.data.list
      pagination.itemCount = response.data.total
    } else {
      message.error(response.message || '獲取管理員列表失敗')
    }
  } catch (error) {
    console.error('加載管理員列表失敗:', error)
    message.error('獲取管理員列表時發生錯誤')
  } finally {
    loading.value = false
  }
}

// 處理帳號狀態變更
async function handleStatusChange(id: string, status: string) {
  // 設置加載狀態
  loadingStatus[id] = true

  try {
    const response = await toggleAdminStatus(id, status)
    if (response.status === 0) {
      message.success(status === '1' ? '啟用成功' : '禁用成功')

      // 更新本地數據，避免重新加載整個列表
      const targetIndex = tableData.value.findIndex((item) => item.id === id)
      if (targetIndex !== -1) {
        tableData.value[targetIndex].status = status
      } else {
        // 如果找不到對應記錄，才重新加載整個列表
        loadTableData()
      }
    } else {
      message.error(response.message || '操作失敗')
      // 操作失敗時重新加載數據以還原狀態
      loadTableData()
    }
  } catch (error) {
    console.error('切換管理員狀態發生錯誤:', error)
    message.error('操作時發生錯誤')
    // 發生錯誤時重新加載數據以還原狀態
    loadTableData()
  } finally {
    // 清除加載狀態
    loadingStatus[id] = false
  }
}

// 處理 Google 驗證狀態變更
function handleGoogleAuthChange(admin: Admin) {
  // 儲存當前管理員資料以便後續使用
  currentAdmin.value = { ...admin, google_status: admin.google_status || '0' }

  // 顯示確認彈窗
  showGoogleAuthModal.value = true
}

// 確認切換 Google 驗證狀態
async function confirmToggleGoogleAuth() {
  // 設置加載狀態
  loadingGoogleStatus[currentAdmin.value.id] = true

  try {
    const newStatus = currentAdmin.value.google_status === '1' ? '0' : '1'
    const response = await toggleAdminGoogleAuth(currentAdmin.value.id, newStatus)

    if (response.status === 0) {
      message.success(newStatus === '1' ? 'Google 驗證開啟成功' : 'Google 驗證關閉成功')

      // 更新本地數據，避免重新加載整個列表
      const targetIndex = tableData.value.findIndex((item) => item.id === currentAdmin.value.id)
      if (targetIndex !== -1) {
        // 處理可能的類型問題
        const updatedItem = tableData.value[targetIndex]
        updatedItem.google_status = newStatus
      } else {
        // 如果找不到對應記錄，才重新加載整個列表
        loadTableData()
      }
    } else {
      message.error(response.message || '操作失敗')
      // 操作失敗時重新加載數據以還原狀態
      loadTableData()
    }
  } catch (error) {
    console.error('切換 Google 驗證狀態發生錯誤:', error)
    message.error('操作時發生錯誤')
    // 發生錯誤時重新加載數據以還原狀態
    loadTableData()
  } finally {
    // 清除加載狀態
    loadingGoogleStatus[currentAdmin.value.id] = false
    showGoogleAuthModal.value = false
  }
}

// 取消切換 Google 驗證狀態
function cancelToggleGoogleAuth() {
  showGoogleAuthModal.value = false
}

// 處理表格行樣式
const rowClassName = (row: Admin) => {
  if (row.status === '0') {
    return 'inactive-row'
  }
  return ''
}

// 打開創建模態框
function openCreateModal() {
  isEdit.value = false
  resetForm()
  showForm.value = true
}

// 編輯管理員
function handleEdit(row: Admin) {
  isEdit.value = true

  // 複製當前管理員數據到表單
  formData.id = row.id
  formData.account_name = row.account_name
  formData.password = '' // 編輯時不顯示密碼
  formData.role_id = row.role_id
  formData.status = row.status

  showForm.value = true
}

// 重置表單
function resetForm() {
  formData.id = ''
  formData.account_name = ''
  formData.password = ''
  formData.role_id = ''
  formData.status = '1'

  // 手動重置表單驗證狀態
  formRef.value?.restoreValidation()
}

// 提交表單
function submitForm() {
  // 手動驗證密碼
  if (!isEdit.value && !formData.password) {
    message.error('請輸入密碼')
    return
  }

  formRef.value?.validate(async (errors) => {
    if (!errors) {
      submitting.value = true
      try {
        if (isEdit.value) {
          // 更新管理員
          const response = await updateAdmin(
            formData.id,
            formData.password, // 如果為空則不更新密碼
            formData.role_id,
            formData.status,
          )

          if (response.status === 0) {
            message.success('更新管理員成功')
            showForm.value = false
            loadTableData()
          } else {
            message.error(response.message || '更新管理員失敗')
          }
        } else {
          // 創建管理員
          const response = await createAdmin(
            formData.account_name,
            formData.password,
            formData.role_id,
          )

          if (response.status === 0) {
            message.success('創建管理員成功')
            showForm.value = false
            loadTableData()
          } else {
            message.error(response.message || '創建管理員失敗')
          }
        }
      } catch (error) {
        message.error('操作時發生錯誤')
        console.error(error)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 彈出刪除確認框
function promptDeleteAdmin(id: string) {
  adminIdToDelete.value = id
  showDeleteConfirm.value = true
}

// 確認刪除 (注意: API 沒有提供刪除功能，這裡僅作為示範)
function confirmDelete() {
  message.warning('刪除功能未實現，API 尚未提供此功能')
  showDeleteConfirm.value = false
  adminIdToDelete.value = ''
}

// 取消刪除
function cancelDelete() {
  showDeleteConfirm.value = false
  adminIdToDelete.value = ''
}

// 搜尋處理
const handleSearch = () => {
  pagination.page = 1
  searchParams.page = 1
  loadTableData()
}

// 清除搜尋條件
const clearSearch = () => {
  // 重置所有搜尋參數
  searchParams.account_name = ''
  searchParams.role_id = null
  searchParams.status = null

  message.info('已清除搜尋條件')
  handleSearch()
}

// 監聽分頁大小變化
watch(
  () => searchParams.page_limit,
  (newValue) => {
    pagination.pageSize = newValue
    pagination.page = 1
    loadTableData()
  },
)
</script>

<style scoped>
.admin-account-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
}

.search-area {
  margin-bottom: 20px;
}

.search-item {
  display: flex;
  flex-direction: column;
}

.search-item .label {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
}

.search-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.data-table-area {
  margin-bottom: 20px;
}

:deep(.inactive-row) {
  background-color: #fafafa;
  color: #999;
}

:deep(.n-data-table-td) {
  padding: 8px !important;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>

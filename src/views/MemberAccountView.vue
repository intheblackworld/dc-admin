<template>
  <div class="member-account-page">
    <div class="page-header">
      <h1>會員帳號</h1>
      <div class="page-tools">
        <div class="page-breadcrumb">會員管理>會員帳號</div>
      </div>
    </div>

    <!-- 搜尋區域 -->
    <n-card class="search-area">
      <n-grid :cols="24" :x-gap="12" :y-gap="16">
        <!-- 第一列 -->
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">帳號狀態</div>
            <n-select
              v-model:value="searchParams.account_status"
              :options="accountStatusOptions"
              placeholder="請選擇"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">帳號名稱</div>
            <n-input
              v-model:value="searchParams.account_name"
              placeholder="請輸入帳號名稱"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">暱稱</div>
            <n-input v-model:value="searchParams.nick_name" placeholder="請輸入暱稱" clearable />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">手機號碼</div>
            <n-input
              v-model:value="searchParams.phone_num"
              placeholder="請輸入手機號碼"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">身份證號碼</div>
            <n-input
              v-model:value="searchParams.id_card_number"
              placeholder="請輸入身份證號碼"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">真實姓名</div>
            <n-input
              v-model:value="searchParams.real_name"
              placeholder="請輸入真實姓名"
              clearable
            />
          </div>
        </n-grid-item>

        <!-- 第二列 -->
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">直屬上級代理UID</div>
            <n-input v-model:value="searchParams.agent_id" placeholder="請輸入代理UID" clearable />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">VIP等級</div>
            <n-select
              v-model:value="searchParams.vip_level"
              :options="vipLevelOptions"
              placeholder="請選擇"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">風控等級</div>
            <n-select
              v-model:value="searchParams.risk_level"
              :options="riskLevelOptions"
              placeholder="請選擇"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="12">
          <div class="search-buttons">
            <n-button type="primary" @click="handleSearch">搜尋</n-button>
            <n-button @click="clearSearch">清除查詢</n-button>
          </div>
        </n-grid-item>

        <!-- 第三列 -->
        <n-grid-item :span="8">
          <div class="search-item">
            <div class="label">註冊時間</div>
            <n-date-picker
              v-model:value="registerTimeRange"
              type="daterange"
              clearable
              style="width: 100%"
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="8">
          <div class="search-item">
            <div class="label">最後登入時間</div>
            <n-date-picker
              v-model:value="lastLoginTimeRange"
              type="daterange"
              clearable
              style="width: 100%"
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="8">
          <div class="search-item">
            <div class="label">每頁顯示</div>
            <n-select
              v-model:value="searchParams.page_size"
              :options="pageSizeOptions"
              placeholder="請選擇每頁數量"
            />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, watch } from 'vue'
import { NTag, NSwitch, NButton, NSpace, useMessage } from 'naive-ui'
import { getMemberList, toggleMemberStatus, type Member } from '@/lib/api'
import dayjs from 'dayjs'

const message = useMessage()

// 載入狀態
const loading = ref(false)
const tableData = ref<Member[]>([])

// 啟用/停用按鈕的載入狀態
const loadingStatus = reactive<Record<string, boolean>>({})

// 分頁相關
const pagination = reactive({
  page: 1,
  pageSize: 20,
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
    searchParams.page_size = pageSize
    loadTableData()
  },
})

// 日期區間
const registerTimeRange = ref<[number, number] | null>(null)
const lastLoginTimeRange = ref<[number, number] | null>(null)

// 搜尋參數
const searchParams = reactive({
  page: 1,
  page_size: 20,
  account_status: null as string | null,
  account_name: '',
  nick_name: '',
  phone_num: '',
  id_card_number: '',
  real_name: '',
  agent_id: '',
  vip_level: null as string | null,
  risk_level: null as string | null,
  register_time_start: '',
  register_time_end: '',
  last_login_at_start: '',
  last_login_at_end: '',
})

// 監聽日期範圍變化
watch(registerTimeRange, (newValue) => {
  if (newValue) {
    searchParams.register_time_start = dayjs(newValue[0]).format('YYYY-MM-DD')
    searchParams.register_time_end = dayjs(newValue[1]).format('YYYY-MM-DD')
  } else {
    searchParams.register_time_start = ''
    searchParams.register_time_end = ''
  }
})

watch(lastLoginTimeRange, (newValue) => {
  if (newValue) {
    searchParams.last_login_at_start = dayjs(newValue[0]).format('YYYY-MM-DD')
    searchParams.last_login_at_end = dayjs(newValue[1]).format('YYYY-MM-DD')
  } else {
    searchParams.last_login_at_start = ''
    searchParams.last_login_at_end = ''
  }
})

// 下拉選項
const accountStatusOptions = [
  { label: '正常', value: '1' },
  { label: '封號', value: '2' },
]

const vipLevelOptions = [
  { label: 'VIP0', value: '0' },
  { label: 'VIP1', value: '1' },
  { label: 'VIP2', value: '2' },
  { label: 'VIP3', value: '3' },
  { label: 'VIP4', value: '4' },
  { label: 'VIP5', value: '5' },
  { label: 'VIP6', value: '6' },
  { label: 'VIP7', value: '7' },
  { label: 'VIP8', value: '8' },
  { label: 'VIP9', value: '9' },
  { label: 'VIP10', value: '10' },
]

const riskLevelOptions = [
  { label: '0', value: '0' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
]

const pageSizeOptions = [
  { label: '10條/頁', value: 10 },
  { label: '20條/頁', value: 20 },
  { label: '30條/頁', value: 30 },
  { label: '50條/頁', value: 50 },
]

// 表格列定義
const columns = [
  {
    title: 'UID',
    key: 'uid',
    width: 100,
  },
  {
    title: '帳號名稱',
    key: 'account_name',
    width: 120,
  },
  {
    title: '暱稱',
    key: 'nick_name',
    width: 120,
  },
  {
    title: '手機號碼',
    key: 'phone_num',
    width: 120,
  },
  {
    title: '身份證號碼',
    key: 'id_card_number',
    width: 150,
  },
  {
    title: '直屬上級代理',
    key: 'agent_id',
    width: 120,
  },
  {
    title: 'VIP等級',
    key: 'vip_level',
    width: 100,
    render(row: Member) {
      return h(
        NTag,
        {
          type: 'success',
          size: 'small',
        },
        { default: () => `VIP${row.vip_level}` },
      )
    },
  },
  {
    title: '風控等級',
    key: 'risk_level',
    width: 100,
  },
  {
    title: '註冊時間',
    key: 'register_time',
    width: 180,
    render(row: Member) {
      return formatDateTime(row.register_time)
    },
  },
  {
    title: '最後登入時間',
    key: 'last_login_at',
    width: 180,
    render(row: Member) {
      return formatDateTime(row.last_login_at)
    },
  },
  {
    title: '會員狀態',
    key: 'account_status',
    width: 120,
    render(row: Member) {
      const statusText = row.account_status === '1' ? '正常' : '封號'
      const statusColor = row.account_status === '1' ? '#18a058' : '#d03050'

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
            value: row.account_status === '1',
            loading: loadingStatus[row.uid] === true,
            onUpdateValue: (value: boolean) => {
              handleStatusChange(row.uid, value ? '1' : '2')
            },
            railStyle: () => {
              return { background: row.account_status === '1' ? '#18a058' : '#d03050' }
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
    width: 120,
    fixed: 'right',
    render(row: Member) {
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
                onClick: () => handleViewDetail(row),
              },
              { default: () => '詳情' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                ghost: true,
                onClick: () => handleSendMessage(row),
              },
              { default: () => '發信' },
            ),
          ],
        },
      )
    },
  },
]

// 格式化日期時間
function formatDateTime(dateTime: string): string {
  if (!dateTime) return '-'
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}

// 加載表格數據
async function loadTableData() {
  loading.value = true
  try {
    // 準備請求參數
    const params = { ...searchParams }
    const response = await getMemberList(params)

    if (response.status === 0) {
      tableData.value = response.data.list
      pagination.itemCount = response.data.total
    } else {
      message.error(response.message || '獲取會員列表失敗')
    }
  } catch (error) {
    console.error('加載會員列表失敗:', error)
    message.error('獲取會員列表時發生錯誤')
  } finally {
    loading.value = false
  }
}

// 初次加載
onMounted(() => {
  loadTableData()
})

// 處理啟用/停用會員狀態
async function handleStatusChange(uid: string, status: string) {
  console.log(`切換會員狀態: UID=${uid}, 新狀態=${status}`)
  // 設置加載狀態
  loadingStatus[uid] = true

  try {
    const response = await toggleMemberStatus(uid, status)
    if (response.status === 0) {
      message.success(status === '1' ? '啟用成功' : '封號成功')
      // 更新本地數據，避免重新加載整個列表
      const targetIndex = tableData.value.findIndex((item) => item.uid === uid)
      if (targetIndex !== -1) {
        tableData.value[targetIndex].account_status = status
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
    console.error('切換會員狀態發生錯誤:', error)
    message.error('操作時發生錯誤')
    // 發生錯誤時重新加載數據以還原狀態
    loadTableData()
  } finally {
    // 清除加載狀態
    loadingStatus[uid] = false
  }
}

// 處理表格行樣式
const rowClassName = (row: Member) => {
  if (row.account_status === '2') {
    return 'inactive-row'
  }
  return ''
}

// 查看會員詳情
function handleViewDetail(row: Member) {
  message.info(`查看會員詳情：${row.account_name}`)
}

// 發送站內信
function handleSendMessage(row: Member) {
  message.info(`向會員 ${row.account_name} 發送站內信`)
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
  Object.keys(searchParams).forEach((key) => {
    if (key !== 'page' && key !== 'page_size') {
      // @ts-expect-error 這裡類型比較複雜，但操作是安全的
      searchParams[key] = typeof searchParams[key] === 'string' ? '' : null
    }
  })

  // 重置日期區間
  registerTimeRange.value = null
  lastLoginTimeRange.value = null

  message.info('已清除搜尋條件')
  handleSearch()
}
</script>

<style scoped>
.member-account-page {
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
  align-items: flex-end;
  gap: 10px;
  height: 100%;
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
</style>

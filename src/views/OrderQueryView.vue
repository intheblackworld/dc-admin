<template>
  <div class="order-query-page">
    <div class="page-header">
      <h1>訂單查詢</h1>
      <div class="page-tools">
        <div class="page-breadcrumb">各式查詢>訂單查詢</div>
      </div>
    </div>

    <!-- 搜尋區域 -->
    <n-card class="search-area">
      <n-grid :cols="24" :x-gap="12" :y-gap="16">
        <!-- 類型選擇 -->
        <n-grid-item :span="24">
          <div class="search-item">
            <div class="label">類型</div>
            <div class="type-buttons">
              <n-button
                v-for="type in orderTypes"
                :key="type.value"
                size="small"
                :type="isSelectedType(type.value) ? 'primary' : 'default'"
                @click="toggleType(type.value)"
              >
                {{ type.label }}
              </n-button>
            </div>
          </div>
        </n-grid-item>

        <!-- 金流商 -->
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">金流商</div>
            <n-select
              v-model:value="searchParams.paymentProvider"
              :options="paymentProviderOptions"
              placeholder="請選擇金流商"
              clearable
            />
          </div>
        </n-grid-item>

        <!-- 申請區間 -->
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">申請區間</div>
            <n-date-picker
              v-model:value="searchParams.applyTimeRange"
              type="daterange"
              clearable
              style="width: 100%"
            />
          </div>
        </n-grid-item>

        <!-- 操作區間 -->
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">操作區間</div>
            <n-date-picker
              v-model:value="searchParams.operationTimeRange"
              type="daterange"
              clearable
              style="width: 100%"
            />
          </div>
        </n-grid-item>

        <!-- 上層帳號 -->
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">上層帳號</div>
            <n-input
              v-model:value="searchParams.parentAccount"
              placeholder="請輸入上層帳號"
              clearable
            />
          </div>
        </n-grid-item>

        <!-- 上層帳號（含下線） -->
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">上層帳號（含下線）</div>
            <n-input
              v-model:value="searchParams.parentAccountWithSub"
              placeholder="請輸入上層帳號（含下線）"
              clearable
            />
          </div>
        </n-grid-item>

        <!-- 會員帳號 -->
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">會員帳號</div>
            <n-input
              v-model:value="searchParams.memberAccount"
              placeholder="請輸入會員帳號"
              clearable
            />
          </div>
        </n-grid-item>

        <!-- 每頁筆數 -->
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">每頁筆數</div>
            <n-select
              v-model:value="pagination.pageSize"
              :options="pageSizeOptions"
              @update:value="onUpdatePageSize"
            />
          </div>
        </n-grid-item>

        <!-- 訂單狀態 -->
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">訂單狀態</div>
            <n-select
              v-model:value="searchParams.orderStatus"
              :options="orderStatusOptions"
              placeholder="請選擇訂單狀態"
              clearable
            />
          </div>
        </n-grid-item>

        <n-grid-item :span="24">
          <div class="search-buttons">
            <n-button type="primary" @click="handleSearch">搜尋</n-button>
            <n-button @click="clearSearch">清除查詢</n-button>
          </div>
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 表格區域 -->
    <n-card class="data-table-area">
      <div class="transaction-summary">
        <div class="summary-item">
          <span class="summary-label">總計交易金額：</span>
          <span class="summary-value">{{ formatCurrency(totalAmount) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">小計交易金額：</span>
          <span class="summary-value">{{ formatCurrency(subtotalAmount) }}</span>
        </div>
      </div>

      <n-data-table
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        :bordered="false"
        :loading="loading"
        size="small"
        stripe
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMessage, type DataTableColumns } from 'naive-ui'
import type { InternalRowData } from 'naive-ui/es/data-table/src/interface'

const message = useMessage()

// 訂單類型選項
const orderTypes = [
  { label: '三方入款', value: 'third_party_deposit' },
  { label: '出款管理', value: 'withdrawal' },
  { label: '活動上分', value: 'activity' },
  { label: '手動入款', value: 'manual_deposit' },
  { label: '手動扣點', value: 'manual_deduction' },
  { label: '代理自辦', value: 'agent_self' },
  { label: '反水', value: 'rebate' },
  { label: '紅利反水', value: 'bonus_rebate' },
  { label: '轉入', value: 'transfer_in' },
  { label: '轉出', value: 'transfer_out' },
]

// 金流商選項
const paymentProviderOptions = [
  { label: '數支付', value: 'digital_pay' },
  { label: '負責東', value: 'responsible_east' },
]

// 訂單狀態選項
const orderStatusOptions = [
  { label: '待處理', value: 'pending' },
  { label: '處理完畢', value: 'completed' },
  { label: '處理失敗', value: 'failed' },
  { label: '待定中', value: 'processing' },
  { label: '與綁定資料不符', value: 'mismatch' },
]

// 每頁筆數選項
const pageSizeOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

// 搜尋參數
const searchParams = reactive({
  selectedTypes: [] as string[],
  paymentProvider: null,
  applyTimeRange: null,
  operationTimeRange: null,
  parentAccount: '',
  parentAccountWithSub: '',
  memberAccount: '',
  orderStatus: null,
})

// 檢查訂單類型是否被選中
const isSelectedType = (value: string) => {
  return searchParams.selectedTypes.includes(value)
}

// 切換訂單類型選擇狀態
const toggleType = (value: string) => {
  const index = searchParams.selectedTypes.indexOf(value)
  if (index === -1) {
    searchParams.selectedTypes.push(value)
  } else {
    searchParams.selectedTypes.splice(index, 1)
  }
}

// 表格相關
const loading = ref(false)

// 訂單介面
interface Order extends InternalRowData {
  id: string
  memberAccount: string
  parentAccount: string
  applyTime: string
  orderType: string
  source: string
  destination: string
  beforeAmount: number
  changeAmount: number
  actualAmount: number
  afterAmount: number
  paymentChannel: string
  status: string
  operator: string
  operationTime: string
  remark: string
}

const tableData = ref<Order[]>([])
const totalAmount = ref(0)
const subtotalAmount = ref(0)

// 分頁相關
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.page = page
    loadTableData()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    loadTableData()
  },
})

// 更新每頁顯示數量
const onUpdatePageSize = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadTableData()
}

// 表格列定義
const columns: DataTableColumns = [
  {
    title: '訂單編號',
    key: 'id',
    width: 120,
  },
  {
    title: '會員帳號',
    key: 'memberAccount',
    width: 120,
  },
  {
    title: '上層帳號/申請時間',
    key: 'parentAccount',
    width: 150,
    render(row) {
      return `${row.parentAccount}<br>${row.applyTime}`
    },
  },
  {
    title: '類型',
    key: 'orderType',
    width: 120,
  },
  {
    title: '來源 目的',
    key: 'source',
    width: 120,
    render(row) {
      return `${row.source}<br>${row.destination}`
    },
  },
  {
    title: '變動前金額',
    key: 'beforeAmount',
    width: 120,
  },
  {
    title: '變動金額',
    key: 'changeAmount',
    width: 120,
  },
  {
    title: '實際金額',
    key: 'actualAmount',
    width: 120,
  },
  {
    title: '變動後金額',
    key: 'afterAmount',
    width: 120,
  },
  {
    title: '繳費管道',
    key: 'paymentChannel',
    width: 120,
  },
  {
    title: '狀態',
    key: 'status',
    width: 100,
  },
  {
    title: '操作人/時間',
    key: 'operator',
    width: 150,
    render(row) {
      return `${row.operator}<br>${row.operationTime}`
    },
  },
  {
    title: '備註',
    key: 'remark',
    width: 150,
  },
]

// 加載表格數據
const loadTableData = () => {
  loading.value = true
  // 模擬數據加載
  setTimeout(() => {
    // 模擬數據
    const mockData: Order[] = Array.from({ length: 20 }).map((_, index) => {
      const changeAmount = Math.floor(Math.random() * 10000)
      const beforeAmount = Math.floor(Math.random() * 50000)
      const afterAmount = beforeAmount + changeAmount

      // 隨機選擇訂單類型
      const orderTypeIndex = Math.floor(Math.random() * orderTypes.length)
      const orderType = orderTypes[orderTypeIndex].label

      // 隨機選擇狀態
      const statusIndex = Math.floor(Math.random() * orderStatusOptions.length)
      const status = orderStatusOptions[statusIndex].label

      return {
        id: `ORD${String(100000 + index).padStart(6, '0')}`,
        memberAccount: `member_${1000 + index}`,
        parentAccount: `agent_${500 + Math.floor(index / 2)}`,
        applyTime: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        orderType: orderType,
        source: '系統',
        destination: '會員錢包',
        beforeAmount: beforeAmount,
        changeAmount: changeAmount,
        actualAmount: Math.floor(changeAmount * 0.98), // 實際金額略小於變動金額
        afterAmount: afterAmount,
        paymentChannel: Math.random() > 0.5 ? '數支付' : '負責東',
        status: status,
        operator: `admin_${100 + Math.floor(Math.random() * 10)}`,
        operationTime: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        remark: Math.random() > 0.7 ? '操作成功' : '',
      }
    })

    tableData.value = mockData
    pagination.itemCount = 150 // 假設共有150條數據

    // 計算總金額和小計金額
    totalAmount.value = mockData.reduce((sum, item) => sum + item.changeAmount, 0)
    subtotalAmount.value = mockData.reduce((sum, item) => sum + item.actualAmount, 0)

    loading.value = false
  }, 500)
}

// 格式化貨幣
const formatCurrency = (value: number) => {
  return value.toLocaleString('zh-TW', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// 搜尋處理
const handleSearch = () => {
  loading.value = true
  pagination.page = 1
  setTimeout(() => {
    message.success('搜尋成功')
    loadTableData()
  }, 300)
}

// 清除搜尋條件
const clearSearch = () => {
  // 重置所有搜尋參數
  Object.assign(searchParams, {
    selectedTypes: [],
    paymentProvider: null,
    applyTimeRange: null,
    operationTimeRange: null,
    parentAccount: '',
    parentAccountWithSub: '',
    memberAccount: '',
    orderStatus: null,
  })

  message.info('已清除搜尋條件')
  handleSearch()
}

// 初次加載
loadTableData()
</script>

<style scoped>
.order-query-page {
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

.page-breadcrumb {
  font-size: 14px;
  color: #606266;
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

.type-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.search-buttons {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.data-table-area {
  margin-bottom: 20px;
}

.transaction-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.summary-item {
  font-size: 14px;
}

.summary-label {
  font-weight: bold;
  margin-right: 5px;
}

.summary-value {
  color: #1890ff;
  font-weight: bold;
}

:deep(.n-data-table-td) {
  padding: 8px !important;
}
</style>

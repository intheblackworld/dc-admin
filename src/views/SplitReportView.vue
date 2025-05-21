<template>
  <div class="split-report-page">
    <div class="page-header">
      <h1>拆帳報表</h1>
      <div class="page-tools">
        <div class="page-breadcrumb">報表管理>拆帳報表</div>
      </div>
    </div>

    <!-- 搜尋區域 -->
    <n-card class="search-area">
      <n-grid :cols="24" :x-gap="12" :y-gap="16">
        <n-grid-item :span="8">
          <div class="search-item">
            <div class="label">統計時間</div>
            <n-date-picker
              v-model:value="searchParams.statisticsTime"
              type="daterange"
              clearable
              style="width: 100%"
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="8">
          <div class="search-item">
            <div class="label">代理帳號</div>
            <n-input
              v-model:value="searchParams.agentAccount"
              placeholder="請輸入代理帳號"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="8">
          <div class="search-buttons">
            <n-button type="primary" @click="handleSearch">搜尋</n-button>
            <n-button @click="clearSearch">清除查詢</n-button>
          </div>
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 表格區域 -->
    <n-card class="data-table-area">
      <div class="table-actions">
        <n-button class="back-button" @click="goBack">
          <template #icon>
            <n-icon><arrow-back-icon /></n-icon>
          </template>
          回到上一層
        </n-button>
      </div>
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
import { ref, reactive, h } from 'vue'
import { useMessage, type DataTableColumns, NButton } from 'naive-ui'
import type { InternalRowData } from 'naive-ui/es/data-table/src/interface'
import { ArrowBackOutline as ArrowBackIcon } from '@vicons/ionicons5'

const message = useMessage()

// 搜尋參數
const searchParams = reactive({
  statisticsTime: null,
  agentAccount: '',
})

// 表格相關
const loading = ref(false)

// 拆帳報表介面
interface SplitReport extends InternalRowData {
  id: number
  agentAccountName: string
  totalBet: number
  totalOrders: number
  totalWinLoss: number
  userRebate: number
  bonusRebate: number
  activityGift: number
  cashFlowFee: number
  agentSelf: string
  totalDeposit: number
  manualDeduct: number
  lottery: number
  currentLevelWinLoss: number
  currentLevelPercentage: string
  currentLevelIncome: number
  water: number
}

const tableData = ref<SplitReport[]>([])

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
    loadTableData()
  },
})

// 表格列定義
const columns: DataTableColumns = [
  {
    title: '代理帳號/名稱',
    key: 'agentAccountName',
    width: 120,
  },
  {
    title: '總投注量',
    key: 'totalBet',
    width: 100,
  },
  {
    title: '總注單量',
    key: 'totalOrders',
    width: 100,
  },
  {
    title: '總輸贏',
    key: 'totalWinLoss',
    width: 100,
  },
  {
    title: '使用者反水',
    key: 'userRebate',
    width: 100,
  },
  {
    title: '紅利反水',
    key: 'bonusRebate',
    width: 100,
  },
  {
    title: '活動贈點',
    key: 'activityGift',
    width: 100,
  },
  {
    title: '金流費用',
    key: 'cashFlowFee',
    width: 100,
  },
  {
    title: '代理自辦',
    key: 'agentSelf',
    width: 100,
  },
  {
    title: '總儲值',
    key: 'totalDeposit',
    width: 100,
  },
  {
    title: '手動扣點',
    key: 'manualDeduct',
    width: 100,
  },
  {
    title: '彩球',
    key: 'lottery',
    width: 80,
  },
  {
    title: '本級輸贏',
    key: 'currentLevelWinLoss',
    width: 100,
  },
  {
    title: '本級佔成成數',
    key: 'currentLevelPercentage',
    width: 120,
  },
  {
    title: '本級佔成所得',
    key: 'currentLevelIncome',
    width: 120,
  },
  {
    title: '夾水',
    key: 'water',
    width: 80,
  },
  {
    title: '明細',
    key: 'detail',
    width: 80,
    render(row: InternalRowData) {
      const data = row as SplitReport
      return h(
        NButton,
        {
          size: 'small',
          secondary: true,
          onClick: () => viewDetail(data),
        },
        { default: () => '查看' },
      )
    },
  },
]

// 回到上一層
const goBack = () => {
  // 在實際應用中，這可能是導航到上一層代理或返回上一頁
  message.info('返回上一層')
}

// 加載表格數據
const loadTableData = () => {
  loading.value = true
  // 模擬數據加載
  setTimeout(() => {
    // 這裡用模擬數據
    tableData.value = Array.from({ length: 20 }).map((_, index) => {
      const totalBet = Math.floor(Math.random() * 1000000)
      const totalOrders = Math.floor(Math.random() * 500)
      const totalWinLoss = Math.floor(Math.random() * 100000 - 50000)
      const userRebate = Math.floor(Math.random() * 5000)
      const bonusRebate = Math.floor(Math.random() * 3000)
      const activityGift = Math.floor(Math.random() * 2000)
      const cashFlowFee = Math.floor(Math.random() * 1000)
      const totalDeposit = Math.floor(Math.random() * 50000)
      const manualDeduct = Math.floor(Math.random() * 2000)
      const lottery = Math.floor(Math.random() * 1000)
      const currentLevelWinLoss = Math.floor(Math.random() * 20000 - 10000)
      const currentLevelPercentage = (Math.random() * 30 + 10).toFixed(2)
      const currentLevelIncome = Math.floor(
        (currentLevelWinLoss * parseFloat(currentLevelPercentage)) / 100,
      )
      const water = Math.floor(Math.random() * 2000)

      return {
        id: index + 1,
        agentAccountName: `agent_${1000 + index} / 代理${index}`,
        totalBet: totalBet,
        totalOrders: totalOrders,
        totalWinLoss: totalWinLoss,
        userRebate: userRebate,
        bonusRebate: bonusRebate,
        activityGift: activityGift,
        cashFlowFee: cashFlowFee,
        agentSelf: Math.random() > 0.5 ? '是' : '否',
        totalDeposit: totalDeposit,
        manualDeduct: manualDeduct,
        lottery: lottery,
        currentLevelWinLoss: currentLevelWinLoss,
        currentLevelPercentage: currentLevelPercentage + '%',
        currentLevelIncome: currentLevelIncome,
        water: water,
      }
    })

    pagination.itemCount = 120 // 假設共有120條數據
    loading.value = false
  }, 500)
}

// 查看明細
const viewDetail = (row: SplitReport) => {
  message.info(`查看 ${row.agentAccountName} 的詳細資料`)
}

// 處理表格行樣式
const rowClassName = (row: SplitReport) => {
  if (row.totalWinLoss < 0) {
    return 'negative-row'
  }
  return ''
}

// 初次加載
loadTableData()

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
    statisticsTime: null,
    agentAccount: '',
  })

  message.info('已清除搜尋條件')
  handleSearch()
}
</script>

<style scoped>
.split-report-page {
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

.table-actions {
  margin-bottom: 16px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

:deep(.negative-row) {
  color: #f5222d;
}

:deep(.n-data-table-td) {
  padding: 8px !important;
}
</style>

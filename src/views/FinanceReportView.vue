<template>
  <div class="finance-report-page">
    <div class="page-header">
      <h1>帳務報表</h1>
      <div class="page-tools">
        <div class="page-breadcrumb">報表管理>帳務報表</div>
      </div>
    </div>

    <!-- 搜尋區域 -->
    <n-card class="search-area">
      <n-grid :cols="24" :x-gap="12" :y-gap="16">
        <n-grid-item :span="6">
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
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">代理帳號</div>
            <n-input
              v-model:value="searchParams.agentAccount"
              placeholder="請輸入代理帳號"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="6">
          <div class="search-item">
            <div class="label">投注金額</div>
            <n-input-group>
              <n-input v-model:value="searchParams.betAmountMin" placeholder="最小值" clearable />
              <div class="separator">-</div>
              <n-input v-model:value="searchParams.betAmountMax" placeholder="最大值" clearable />
            </n-input-group>
          </div>
        </n-grid-item>
        <n-grid-item :span="6">
          <div class="search-buttons">
            <n-button type="primary" @click="handleSearch">搜尋</n-button>
            <n-button @click="clearSearch">清除查詢</n-button>
          </div>
        </n-grid-item>
      </n-grid>

      <!-- 遊戲平台選擇區 -->
      <div class="game-platform-selection">
        <div class="platform-header">
          <div class="label">遊戲平台</div>
          <div class="platform-actions">
            <n-button size="small" @click="selectAllPlatforms">全選</n-button>
            <n-button size="small" @click="clearAllPlatforms">清除</n-button>
          </div>
        </div>

        <!-- 體育 -->
        <div class="platform-category">
          <div class="category-title">體育</div>
          <div class="platform-buttons">
            <n-button
              v-for="platform in gamePlatforms.sports"
              :key="platform.value"
              size="small"
              :type="isSelectedPlatform(platform.value) ? 'primary' : 'default'"
              @click="togglePlatform(platform.value)"
            >
              {{ platform.label }}
            </n-button>
          </div>
        </div>

        <!-- 電子遊藝 -->
        <div class="platform-category">
          <div class="category-title">電子遊藝</div>
          <div class="platform-buttons">
            <n-button
              v-for="platform in gamePlatforms.electronic"
              :key="platform.value"
              size="small"
              :type="isSelectedPlatform(platform.value) ? 'primary' : 'default'"
              @click="togglePlatform(platform.value)"
            >
              {{ platform.label }}
            </n-button>
          </div>
        </div>

        <!-- 真人娛樂 -->
        <div class="platform-category">
          <div class="category-title">真人娛樂</div>
          <div class="platform-buttons">
            <n-button
              v-for="platform in gamePlatforms.live"
              :key="platform.value"
              size="small"
              :type="isSelectedPlatform(platform.value) ? 'primary' : 'default'"
              @click="togglePlatform(platform.value)"
            >
              {{ platform.label }}
            </n-button>
          </div>
        </div>

        <!-- 彩票 -->
        <div class="platform-category">
          <div class="category-title">彩票</div>
          <div class="platform-buttons">
            <n-button
              v-for="platform in gamePlatforms.lottery"
              :key="platform.value"
              size="small"
              :type="isSelectedPlatform(platform.value) ? 'primary' : 'default'"
              @click="togglePlatform(platform.value)"
            >
              {{ platform.label }}
            </n-button>
          </div>
        </div>

        <!-- 棋牌 -->
        <div class="platform-category">
          <div class="category-title">棋牌</div>
          <div class="platform-buttons">
            <n-button
              v-for="platform in gamePlatforms.chess"
              :key="platform.value"
              size="small"
              :type="isSelectedPlatform(platform.value) ? 'primary' : 'default'"
              @click="togglePlatform(platform.value)"
            >
              {{ platform.label }}
            </n-button>
          </div>
        </div>
      </div>
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
import { ref, reactive } from 'vue'
import { useMessage, type DataTableColumns } from 'naive-ui'
import type { InternalRowData } from 'naive-ui/es/data-table/src/interface'
import { ArrowBackOutline as ArrowBackIcon } from '@vicons/ionicons5'

const message = useMessage()

// 搜尋參數
const searchParams = reactive({
  statisticsTime: null,
  agentAccount: '',
  betAmountMin: '',
  betAmountMax: '',
  selectedPlatforms: [] as string[],
})

// 遊戲平台選項
const gamePlatforms = {
  sports: [
    { label: '鑫寶體育', value: 'xb_sports' },
    { label: '平博體育', value: 'pb_sports' },
    { label: 'SUPER2體育', value: 'super2_sports' },
    { label: '熊貓體育', value: 'panda_sports' },
  ],
  electronic: [
    { label: 'CG電子', value: 'cg_electronic' },
    { label: 'GR電子', value: 'gr_electronic' },
    { label: 'AMEBA電子', value: 'ameba_electronic' },
    { label: 'RSG電子', value: 'rsg_electronic' },
    { label: 'JF電子', value: 'jf_electronic' },
    { label: 'ZG電子', value: 'zg_electronic' },
    { label: 'FG電子', value: 'fg_electronic' },
    { label: 'SPLUS電子', value: 'splus_electronic' },
    { label: '770電子', value: '770_electronic' },
    { label: 'BNG電子', value: 'bng_electronic' },
    { label: 'QT電子', value: 'qt_electronic' },
    { label: 'SPINIX電子', value: 'spinix_electronic' },
    { label: 'GB電子', value: 'gb_electronic' },
    { label: 'ATG電子', value: 'atg_electronic' },
    { label: 'OTG電子', value: 'otg_electronic' },
    { label: 'RG電子', value: 'rg_electronic' },
    { label: 'TAG電子', value: 'tag_electronic' },
  ],
  live: [
    { label: '歐博真人', value: 'ob_live' },
    { label: 'OG真人', value: 'og_live' },
    { label: 'SA真人', value: 'sa_live' },
    { label: 'WM真人', value: 'wm_live' },
    { label: 'DG真人', value: 'dg_live' },
    { label: 'DB真人', value: 'db_live' },
    { label: 'T9真人', value: 't9_live' },
    { label: 'META真人', value: 'meta_live' },
    { label: 'WE真人', value: 'we_live' },
  ],
  lottery: [
    { label: 'GW5六合彩', value: 'gw5_lottery' },
    { label: 'DB彩票', value: 'db_lottery' },
    { label: '9K彩票', value: '9k_lottery' },
    { label: 'Miki World', value: 'miki_lottery' },
    { label: '賓果賽車', value: 'bingo_racing' },
  ],
  chess: [
    { label: '高登棋牌', value: 'gd_chess' },
    { label: '開元棋牌', value: 'ky_chess' },
  ],
}

// 檢查平台是否被選中
const isSelectedPlatform = (value: string) => {
  return searchParams.selectedPlatforms.includes(value)
}

// 切換平台選擇狀態
const togglePlatform = (value: string) => {
  const index = searchParams.selectedPlatforms.indexOf(value)
  if (index === -1) {
    searchParams.selectedPlatforms.push(value)
  } else {
    searchParams.selectedPlatforms.splice(index, 1)
  }
}

// 全選平台
const selectAllPlatforms = () => {
  const allPlatforms: string[] = []
  Object.values(gamePlatforms).forEach((platforms) => {
    platforms.forEach((platform) => {
      allPlatforms.push(platform.value)
    })
  })
  searchParams.selectedPlatforms = allPlatforms
}

// 清除平台選擇
const clearAllPlatforms = () => {
  searchParams.selectedPlatforms = []
}

// 表格相關
const loading = ref(false)

// 帳務報表介面
interface FinanceReport extends InternalRowData {
  id: number
  agentAccount: string
  directMembers: number
  allMembers: number
  totalOrders: number
  betAmount: number
  effectiveBet: number
  memberResult: number
}

const tableData = ref<FinanceReport[]>([])

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
    title: '代理帳號',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '直屬會員',
    key: 'directMembers',
    width: 100,
  },
  {
    title: '所有會員',
    key: 'allMembers',
    width: 100,
  },
  {
    title: '總注單量',
    key: 'totalOrders',
    width: 100,
  },
  {
    title: '下注金額',
    key: 'betAmount',
    width: 120,
  },
  {
    title: '有效投注',
    key: 'effectiveBet',
    width: 120,
  },
  {
    title: '會員結果',
    key: 'memberResult',
    width: 120,
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
      const directMembers = Math.floor(Math.random() * 100 + 1)
      const allMembers = directMembers + Math.floor(Math.random() * 500)
      const totalOrders = Math.floor(Math.random() * 1000 + 10)
      const betAmount = Math.floor(Math.random() * 1000000)
      const effectiveBet = Math.floor(betAmount * 0.8)
      const memberResult = Math.floor(Math.random() * 200000 - 100000)

      return {
        id: index + 1,
        agentAccount: `agent_${1000 + index}`,
        directMembers: directMembers,
        allMembers: allMembers,
        totalOrders: totalOrders,
        betAmount: betAmount,
        effectiveBet: effectiveBet,
        memberResult: memberResult,
      }
    })

    pagination.itemCount = 120 // 假設共有120條數據
    loading.value = false
  }, 500)
}

// 處理表格行樣式
const rowClassName = (row: FinanceReport) => {
  if (row.memberResult < 0) {
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
    betAmountMin: '',
    betAmountMax: '',
    selectedPlatforms: [],
  })

  message.info('已清除搜尋條件')
  handleSearch()
}
</script>

<style scoped>
.finance-report-page {
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

.separator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.game-platform-selection {
  margin-top: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 12px;
  background-color: #f9f9f9;
}

.platform-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.platform-header .label {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.platform-actions {
  display: flex;
  gap: 10px;
}

.platform-category {
  margin-bottom: 12px;
}

.category-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.platform-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

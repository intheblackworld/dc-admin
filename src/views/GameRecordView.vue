<template>
  <div class="game-record-page">
    <div class="page-header">
      <h1>遊戲記錄</h1>
      <div class="page-tools">
        <div class="page-breadcrumb">報表管理>遊戲記錄</div>
      </div>
    </div>

    <!-- 搜尋區域 -->
    <n-card class="search-area">
      <n-grid :cols="24" :x-gap="12" :y-gap="16">
        <!-- 第一列 -->
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">遊戲類別</div>
            <n-select
              v-model:value="searchParams.gameCategory"
              :options="gameCategoryOptions"
              placeholder="請選擇"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">結算狀態</div>
            <n-select
              v-model:value="searchParams.settlementStatus"
              :options="settlementStatusOptions"
              placeholder="請選擇"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">原廠帳號</div>
            <n-input
              v-model:value="searchParams.originalAccount"
              placeholder="請輸入原廠帳號"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">會員帳號</div>
            <n-input
              v-model:value="searchParams.memberAccount"
              placeholder="請輸入會員帳號"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">風控等級</div>
            <n-select
              v-model:value="searchParams.riskLevel"
              :options="riskLevelOptions"
              placeholder="請選擇"
              clearable
            />
          </div>
        </n-grid-item>
        <n-grid-item :span="4">
          <div class="search-item">
            <div class="label">投注金額</div>
            <n-input-group>
              <n-input v-model:value="searchParams.betAmountMin" placeholder="最小值" clearable />
              <div class="separator">-</div>
              <n-input v-model:value="searchParams.betAmountMax" placeholder="最大值" clearable />
            </n-input-group>
          </div>
        </n-grid-item>

        <!-- 第二列 -->
        <n-grid-item :span="8">
          <div class="search-item">
            <div class="label">代理帳號</div>
            <n-input-group>
              <n-select
                v-model:value="searchParams.agentAccountType"
                :options="agentAccountOptions"
                placeholder="請選擇"
                :style="{ width: '150px' }"
                clearable
              />
              <n-input
                v-model:value="searchParams.agentAccount"
                placeholder="請輸入代理帳號"
                clearable
              />
            </n-input-group>
          </div>
        </n-grid-item>
        <n-grid-item :span="16">
          <div class="search-item">
            <div class="label">報表區間</div>
            <n-input-group>
              <n-select
                v-model:value="searchParams.reportPeriodType"
                :options="reportPeriodOptions"
                placeholder="請選擇"
                :style="{ width: '150px' }"
              />
              <n-date-picker
                v-model:value="searchParams.reportPeriod"
                type="datetimerange"
                clearable
                style="width: calc(100% - 150px)"
              />
            </n-input-group>
          </div>
        </n-grid-item>

        <!-- 遊戲平台選擇區 -->
        <n-grid-item :span="24">
          <div class="search-item game-platform-selection">
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
        </n-grid-item>

        <!-- 搜尋按鈕 -->
        <n-grid-item :span="24">
          <div class="search-buttons">
            <n-button type="primary" @click="handleSearch">搜尋</n-button>
            <n-button @click="clearSearch">清除查詢</n-button>
          </div>
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 統計卡片區域 -->
    <div class="stats-cards">
      <n-grid :cols="24" :x-gap="12">
        <n-grid-item :span="12">
          <n-card title="小計" class="stats-card">
            <n-grid :cols="4" :x-gap="12">
              <n-grid-item>
                <div class="stat-item">
                  <div class="stat-label">總注單數</div>
                  <div class="stat-value">{{ stats.subTotal.orderCount }}</div>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="stat-item">
                  <div class="stat-label">有效投注金額</div>
                  <div class="stat-value">{{ stats.subTotal.effectiveBetAmount }}</div>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="stat-item">
                  <div class="stat-label">投注金額</div>
                  <div class="stat-value">{{ stats.subTotal.betAmount }}</div>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="stat-item">
                  <div class="stat-label">輸贏</div>
                  <div class="stat-value" :class="{ negative: stats.subTotal.winLoss < 0 }">
                    {{ stats.subTotal.winLoss }}
                  </div>
                </div>
              </n-grid-item>
            </n-grid>
          </n-card>
        </n-grid-item>
        <n-grid-item :span="12">
          <n-card title="總計" class="stats-card">
            <n-grid :cols="4" :x-gap="12">
              <n-grid-item>
                <div class="stat-item">
                  <div class="stat-label">總注單數</div>
                  <div class="stat-value">{{ stats.total.orderCount }}</div>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="stat-item">
                  <div class="stat-label">有效投注金額</div>
                  <div class="stat-value">{{ stats.total.effectiveBetAmount }}</div>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="stat-item">
                  <div class="stat-label">投注金額</div>
                  <div class="stat-value">{{ stats.total.betAmount }}</div>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="stat-item">
                  <div class="stat-label">輸贏</div>
                  <div class="stat-value" :class="{ negative: stats.total.winLoss < 0 }">
                    {{ stats.total.winLoss }}
                  </div>
                </div>
              </n-grid-item>
            </n-grid>
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>

    <!-- 表格區域 -->
    <n-card class="data-table-area">
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

const message = useMessage()

// 搜尋參數
const searchParams = reactive({
  gameCategory: null,
  settlementStatus: null,
  originalAccount: '',
  memberAccount: '',
  riskLevel: null,
  agentAccountType: null,
  agentAccount: '',
  reportPeriodType: 'settlementTime',
  reportPeriod: null,
  betAmountMin: '',
  betAmountMax: '',
  selectedPlatforms: [] as string[],
})

// 下拉選項
const gameCategoryOptions = [
  { label: '體育', value: 'sports' },
  { label: '電子遊藝', value: 'electronic' },
  { label: '真人娛樂', value: 'live' },
  { label: '彩票', value: 'lottery' },
  { label: '棋牌', value: 'chess' },
]

const settlementStatusOptions = [
  { label: '未結算', value: 'unsettled' },
  { label: '已結算', value: 'settled' },
]

const riskLevelOptions = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
]

const agentAccountOptions = [
  { label: '直屬上級代理', value: 'direct' },
  { label: '上級代理', value: 'upper' },
]

const reportPeriodOptions = [
  { label: '結算時間', value: 'settlementTime' },
  { label: '體育結算時間', value: 'sportsSettlementTime' },
]

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

// 統計數據
const stats = reactive({
  subTotal: {
    orderCount: 0,
    effectiveBetAmount: 0,
    betAmount: 0,
    winLoss: 0,
  },
  total: {
    orderCount: 0,
    effectiveBetAmount: 0,
    betAmount: 0,
    winLoss: 0,
  },
})

// 表格相關
const loading = ref(false)

// 遊戲記錄介面
interface GameRecord {
  id: number
  gameCategory: string
  gamePlatform: string
  betTime: string
  settlementTime: string
  agentAccount: string
  agentName: string
  memberAccount: string
  originalAccount: string
  riskLevel: number
  orderNumber: string
  betInfo: string
  totalOrders: number
  betAmount: number
  effectiveBetAmount: number
  gameResult: string
  winLoss: number
  settlementStatus: string
}

const tableData = ref<GameRecord[]>([])

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
    title: '遊戲類別',
    key: 'gameCategory',
    width: 100,
  },
  {
    title: '遊戲平台',
    key: 'gamePlatform',
    width: 120,
  },
  {
    title: '投注時間',
    key: 'betTime',
    width: 160,
  },
  {
    title: '結算時間',
    key: 'settlementTime',
    width: 160,
  },
  {
    title: '代理帳號',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '代理名稱',
    key: 'agentName',
    width: 120,
  },
  {
    title: '會員號',
    key: 'memberAccount',
    width: 120,
  },
  {
    title: '原廠帳號',
    key: 'originalAccount',
    width: 120,
  },
  {
    title: '風控等級',
    key: 'riskLevel',
    width: 80,
  },
  {
    title: '單號局號',
    key: 'orderNumber',
    width: 120,
  },
  {
    title: '投注資訊',
    key: 'betInfo',
    width: 200,
  },
  {
    title: '總注單數',
    key: 'totalOrders',
    width: 80,
  },
  {
    title: '投注金額',
    key: 'betAmount',
    width: 100,
  },
  {
    title: '有效投注金額',
    key: 'effectiveBetAmount',
    width: 120,
  },
  {
    title: '遊戲結果',
    key: 'gameResult',
    width: 120,
  },
  {
    title: '輸贏',
    key: 'winLoss',
    width: 100,
  },
  {
    title: '結算狀態',
    key: 'settlementStatus',
    width: 100,
  },
]

// 加載表格數據
const loadTableData = () => {
  loading.value = true
  // 模擬數據加載
  setTimeout(() => {
    // 這裡用模擬數據
    tableData.value = Array.from({ length: 20 }).map((_, index) => {
      const betAmount = Math.floor(Math.random() * 10000)
      const effectiveBetAmount = Math.floor(betAmount * 0.9)
      const winLoss = Math.floor(Math.random() * 10000 - 5000)
      const isSettled = Math.random() > 0.2
      const gameCategory =
        gameCategoryOptions[Math.floor(Math.random() * gameCategoryOptions.length)].label

      // 根據遊戲類別選擇對應的平台
      let platformCategory: 'sports' | 'electronic' | 'live' | 'lottery' | 'chess' = 'sports'
      switch (gameCategory) {
        case '體育':
          platformCategory = 'sports'
          break
        case '電子遊藝':
          platformCategory = 'electronic'
          break
        case '真人娛樂':
          platformCategory = 'live'
          break
        case '彩票':
          platformCategory = 'lottery'
          break
        case '棋牌':
          platformCategory = 'chess'
          break
      }

      const platformOptions = gamePlatforms[platformCategory]
      const platform = platformOptions[Math.floor(Math.random() * platformOptions.length)].label

      return {
        id: index + 1,
        gameCategory: gameCategory,
        gamePlatform: platform,
        betTime: `2024-${Math.floor(Math.random() * 12 + 1)}-${Math.floor(Math.random() * 28 + 1)} ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60)}`,
        settlementTime: isSettled
          ? `2024-${Math.floor(Math.random() * 12 + 1)}-${Math.floor(Math.random() * 28 + 1)} ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60)}`
          : '-',
        agentAccount: `agent_${1000 + index}`,
        agentName: `代理${index}`,
        memberAccount: `member_${2000 + index}`,
        originalAccount: `original_${3000 + index}`,
        riskLevel: Math.floor(Math.random() * 5),
        orderNumber: `ORD${100000 + index}`,
        betInfo: `下注: ${Math.random() > 0.5 ? '大' : '小'}, 賠率: ${(1 + Math.random()).toFixed(2)}`,
        totalOrders: Math.floor(Math.random() * 10) + 1,
        betAmount: betAmount,
        effectiveBetAmount: effectiveBetAmount,
        gameResult: Math.random() > 0.5 ? '勝利' : '失敗',
        winLoss: winLoss,
        settlementStatus: isSettled ? '已結算' : '未結算',
      }
    })

    // 更新統計數據
    updateStats()

    pagination.itemCount = 120 // 假設共有120條數據
    loading.value = false
  }, 500)
}

// 更新統計數據
const updateStats = () => {
  // 重置統計
  stats.subTotal.orderCount = 0
  stats.subTotal.effectiveBetAmount = 0
  stats.subTotal.betAmount = 0
  stats.subTotal.winLoss = 0

  // 計算當前頁數據
  tableData.value.forEach((row) => {
    stats.subTotal.orderCount += row.totalOrders
    stats.subTotal.effectiveBetAmount += row.effectiveBetAmount
    stats.subTotal.betAmount += row.betAmount
    stats.subTotal.winLoss += row.winLoss
  })

  // 模擬總計數據 (通常從後端獲取)
  stats.total.orderCount = stats.subTotal.orderCount * 6
  stats.total.effectiveBetAmount = stats.subTotal.effectiveBetAmount * 6
  stats.total.betAmount = stats.subTotal.betAmount * 6
  stats.total.winLoss = stats.subTotal.winLoss * 6
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
    gameCategory: null,
    settlementStatus: null,
    originalAccount: '',
    memberAccount: '',
    riskLevel: null,
    agentAccountType: null,
    agentAccount: '',
    reportPeriodType: 'settlementTime',
    reportPeriod: null,
    betAmountMin: '',
    betAmountMax: '',
    selectedPlatforms: [],
  })

  message.info('已清除搜尋條件')
  handleSearch()
}
</script>

<style scoped>
.game-record-page {
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
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.separator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.game-platform-selection {
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

.stats-cards {
  margin-bottom: 20px;
}

.stats-card {
  height: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.stat-value.negative {
  color: #f5222d;
}

.data-table-area {
  margin-bottom: 20px;
}

:deep(.n-data-table-td) {
  padding: 8px !important;
}
</style>

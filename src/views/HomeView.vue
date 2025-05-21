<template>
  <div class="home">
    <div class="page-header">
      <h1>首頁</h1>
      <div class="page-tools">
        <div class="page-breadcrumb">首頁</div>
        <n-button type="error" size="small" @click="handleLogout">登出</n-button>
      </div>
    </div>

    <!-- 時間範圍選擇按鈕 -->
    <div class="time-filter">
      <n-space>
        <n-button
          type="primary"
          :class="{ active: activeTimeFilter === 'today' }"
          @click="setTimeFilter('today')"
          >今日</n-button
        >
        <n-button
          :class="{ active: activeTimeFilter === 'yesterday' }"
          @click="setTimeFilter('yesterday')"
          >昨日</n-button
        >
        <n-button :class="{ active: activeTimeFilter === 'week' }" @click="setTimeFilter('week')"
          >本週</n-button
        >
        <n-button :class="{ active: activeTimeFilter === 'month' }" @click="setTimeFilter('month')"
          >本月</n-button
        >
        <n-button
          :class="{ active: activeTimeFilter === 'lastMonth' }"
          @click="setTimeFilter('lastMonth')"
          >上月</n-button
        >
      </n-space>
    </div>

    <!-- 載入中提示 -->
    <div v-if="loading" class="loading-wrapper">
      <n-spin size="large" />
      <p>載入中...</p>
    </div>

    <!-- 數據卡片 -->
    <div v-else class="data-cards">
      <n-grid :cols="24" :x-gap="12">
        <!-- 遊戲輸贏 -->
        <n-grid-item :span="8">
          <n-card class="stats-card game-card">
            <div class="card-content">
              <div class="card-left">
                <h3>遊戲輸贏</h3>
                <div class="main-value">投注量</div>
                <div class="value-amount">
                  {{ formatNumber(statisticData?.total_bet_amount || 0) }}
                </div>
                <div class="secondary-value">遊戲輸贏</div>
                <div
                  class="value-amount"
                  :class="{ negative: (statisticData?.game_profit || 0) < 0 }"
                >
                  {{ formatNumber(statisticData?.game_profit || 0) }}
                </div>
              </div>
              <div class="card-icon game-icon">
                <n-icon size="48"><GamepadIcon /></n-icon>
              </div>
            </div>
          </n-card>
        </n-grid-item>

        <!-- 存提款金額 -->
        <n-grid-item :span="8">
          <n-card class="stats-card deposit-card">
            <div class="card-content">
              <div class="card-left">
                <h3>存提款金額</h3>
                <div class="main-value">存款總額</div>
                <div class="value-amount">
                  {{ formatNumber(statisticData?.deposit_total || 0) }}
                </div>
                <div class="secondary-value">提款總額</div>
                <div class="value-amount">
                  {{ formatNumber(statisticData?.withdraw_total || 0) }}
                </div>
              </div>
              <div class="card-icon deposit-icon">
                <n-icon size="48"><CashIcon /></n-icon>
              </div>
            </div>
          </n-card>
        </n-grid-item>

        <!-- 活動成本 -->
        <n-grid-item :span="8">
          <n-card class="stats-card activity-card">
            <div class="card-content">
              <div class="card-left">
                <h3>活動成本</h3>
                <div class="main-value">活動贈點</div>
                <div class="value-amount">{{ formatNumber(statisticData?.event_cost || 0) }}</div>
              </div>
              <div class="card-icon activity-icon">
                <n-icon size="48"><GiftIcon /></n-icon>
              </div>
            </div>
          </n-card>
        </n-grid-item>

        <!-- 成本 -->
        <n-grid-item :span="8">
          <n-card class="stats-card cost-card">
            <div class="card-content">
              <div class="card-left">
                <h3>成本</h3>
                <div class="main-value">反水總額</div>
                <div class="value-amount">{{ formatNumber(statisticData?.rebate_total || 0) }}</div>
                <div class="secondary-value">紅利反水</div>
                <div class="value-amount">{{ formatNumber(statisticData?.bonus_rebate || 0) }}</div>
              </div>
              <div class="card-icon cost-icon">
                <n-icon size="48"><WalletIcon /></n-icon>
              </div>
            </div>
          </n-card>
        </n-grid-item>

        <!-- 會員 -->
        <n-grid-item :span="16">
          <n-card class="stats-card member-card">
            <div class="card-content">
              <div class="card-left members-info">
                <h3>會員</h3>
                <n-grid :cols="8" :x-gap="12">
                  <n-grid-item :span="4">
                    <div class="member-stat">
                      <div>新增會員</div>
                      <div class="value-amount">{{ statisticData?.new_user_count || 0 }}</div>
                    </div>
                  </n-grid-item>
                  <n-grid-item :span="4">
                    <div class="member-stat">
                      <div>舊充會員</div>
                      <div class="value-amount">{{ statisticData?.first_deposit_count || 0 }}</div>
                    </div>
                  </n-grid-item>
                  <n-grid-item :span="4">
                    <div class="member-stat">
                      <div>新增代理</div>
                      <div class="value-amount">{{ statisticData?.new_agent_count || 0 }}</div>
                    </div>
                  </n-grid-item>
                  <n-grid-item :span="4">
                    <div class="member-stat">
                      <div>在線人數</div>
                      <div class="value-amount">{{ onlineCount }}</div>
                    </div>
                  </n-grid-item>
                </n-grid>
              </div>
              <div class="card-icon member-icon">
                <n-icon size="64"><PeopleIcon /></n-icon>
              </div>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>

    <!-- VIP 會員資料 -->
    <div class="vip-section">
      <n-card>
        <n-space vertical>
          <n-grid :cols="5" :x-gap="12">
            <n-grid-item :span="1">
              <n-card
                class="vip-card"
                :class="{ active: activeVip === 'VIP1' }"
                @click="setActiveVip('VIP1')"
              >
                <div class="vip-title">VIP1</div>
                <div class="vip-value">{{ statisticData?.vip1_count || 0 }}</div>
              </n-card>
            </n-grid-item>
            <n-grid-item :span="1">
              <n-card
                class="vip-card"
                :class="{ active: activeVip === 'VIP2' }"
                @click="setActiveVip('VIP2')"
              >
                <div class="vip-title">VIP2</div>
                <div class="vip-value">{{ statisticData?.vip2_count || 0 }}</div>
              </n-card>
            </n-grid-item>
            <n-grid-item :span="1">
              <n-card
                class="vip-card"
                :class="{ active: activeVip === 'VIP3' }"
                @click="setActiveVip('VIP3')"
              >
                <div class="vip-title">VIP3</div>
                <div class="vip-value">{{ statisticData?.vip3_count || 0 }}</div>
              </n-card>
            </n-grid-item>
            <n-grid-item :span="1">
              <n-card
                class="vip-card"
                :class="{ active: activeVip === 'VIP4' }"
                @click="setActiveVip('VIP4')"
              >
                <div class="vip-title">VIP4</div>
                <div class="vip-value">{{ statisticData?.vip4_count || 0 }}</div>
              </n-card>
            </n-grid-item>
            <n-grid-item :span="1">
              <n-card
                class="vip-card"
                :class="{ active: activeVip === 'VIP5' }"
                @click="setActiveVip('VIP5')"
              >
                <div class="vip-title">VIP5</div>
                <div class="vip-value">{{ statisticData?.vip5_count || 0 }}</div>
              </n-card>
            </n-grid-item>
          </n-grid>
        </n-space>
      </n-card>
    </div>

    <!-- 查詢資料表格 -->
    <div class="query-section">
      <n-card title="與銀定資料不符">
        <n-data-table :columns="columns" :data="tableData" :bordered="false" :single-line="false" />
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  GameControllerOutline as GamepadIcon,
  WalletOutline as WalletIcon,
  GiftOutline as GiftIcon,
  PeopleOutline as PeopleIcon,
  CashOutline as CashIcon,
} from '@vicons/ionicons5'
import { NButton, NSpin, useMessage } from 'naive-ui'
import { logout, getDailyStatistics, type DailyStatisticItem } from '../lib/api'

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const statisticData = ref<DailyStatisticItem | null>(null)
const onlineCount = ref(130) // 假設在線人數

// 登出功能
const handleLogout = () => {
  logout()
  message.success('登出成功')
  router.push('/login')
}

// 格式化數字顯示
const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 取得日期範圍
const getDateRange = (filter: string): { startDate: string; endDate: string } => {
  const today = new Date()
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const endDate = formatDate(today)
  let startDate = endDate

  switch (filter) {
    case 'today':
      break
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      startDate = formatDate(yesterday)
      return { startDate, endDate: startDate }
    case 'week':
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      startDate = formatDate(weekStart)
      break
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      startDate = formatDate(monthStart)
      break
    case 'lastMonth':
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      startDate = formatDate(lastMonthStart)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
      return { startDate, endDate: formatDate(lastMonthEnd) }
    default:
      break
  }

  return { startDate, endDate }
}

// 活動時間篩選
const activeTimeFilter = ref('today')
const setTimeFilter = async (filter: string) => {
  activeTimeFilter.value = filter
  await fetchStatisticData()
}

// 獲取統計數據
const fetchStatisticData = async () => {
  loading.value = true
  try {
    const { startDate, endDate } = getDateRange(activeTimeFilter.value)
    const response = await getDailyStatistics(startDate, endDate)

    if (response.status === 0) {
      // 如果有多天數據，我們這裡簡單地合併
      if (response.data.details.length === 1) {
        statisticData.value = response.data.details[0]
      } else {
        // 合併多天數據
        const merged: DailyStatisticItem = {
          stat_date: `${startDate} to ${endDate}`,
          total_bet_amount: 0,
          game_profit: 0,
          deposit_total: 0,
          withdraw_total: 0,
          event_cost: 0,
          rebate_total: 0,
          bonus_rebate: 0,
          new_user_count: 0,
          new_agent_count: 0,
          first_deposit_count: 0,
          vip1_count: 0,
          vip2_count: 0,
          vip3_count: 0,
          vip4_count: 0,
          vip5_count: 0,
          vip6_count: 0,
          vip7_count: 0,
          vip8_count: 0,
          vip9_count: 0,
          vip10_count: 0,
        }

        // 合併所有數據
        response.data.details.forEach((item) => {
          merged.total_bet_amount += item.total_bet_amount
          merged.game_profit += item.game_profit
          merged.deposit_total += item.deposit_total
          merged.withdraw_total += item.withdraw_total
          merged.event_cost += item.event_cost
          merged.rebate_total += item.rebate_total
          merged.bonus_rebate += item.bonus_rebate
          merged.new_user_count += item.new_user_count
          merged.new_agent_count += item.new_agent_count
          merged.first_deposit_count += item.first_deposit_count

          // VIP 數據使用最後一天的數據，不累加
          merged.vip1_count = item.vip1_count
          merged.vip2_count = item.vip2_count
          merged.vip3_count = item.vip3_count
          merged.vip4_count = item.vip4_count
          merged.vip5_count = item.vip5_count
          merged.vip6_count = item.vip6_count
          merged.vip7_count = item.vip7_count
          merged.vip8_count = item.vip8_count
          merged.vip9_count = item.vip9_count
          merged.vip10_count = item.vip10_count
        })

        statisticData.value = merged
      }
    } else {
      message.error('獲取統計數據失敗')
      statisticData.value = null
    }
  } catch (error) {
    console.error('獲取統計數據錯誤:', error)
    message.error('獲取統計數據時發生錯誤')
    statisticData.value = null
  } finally {
    loading.value = false
  }
}

// 活動 VIP 選擇
const activeVip = ref('VIP1')
const setActiveVip = (vip: string) => {
  activeVip.value = vip
}

// 表格數據
interface TableData {
  id: number
  depositAccount: string
  depositor: string
  amount: number
  applyTime: string
}

const tableData: TableData[] = [] // 空數據示例

const columns = [
  {
    title: '編號',
    key: 'id',
    width: 80,
  },
  {
    title: '入款人帳號',
    key: 'depositAccount',
    width: 150,
  },
  {
    title: '入款人',
    key: 'depositor',
    width: 100,
  },
  {
    title: '金額',
    key: 'amount',
    width: 120,
  },
  {
    title: '申請時間',
    key: 'applyTime',
    width: 180,
  },
]

onMounted(async () => {
  await fetchStatisticData()
})
</script>

<style scoped>
.home {
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

.page-tools {
  display: flex;
  align-items: center;
  gap: 16px;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.time-filter {
  margin-bottom: 24px;
}

.time-filter :deep(.n-button) {
  min-width: 80px;
}

.time-filter :deep(.n-button.active) {
  background-color: #1890ff;
  color: white;
}

.data-cards {
  margin-bottom: 24px;
}

.stats-card {
  margin-bottom: 16px;
  height: calc(100% - 16px);
}

.card-content {
  display: flex;
  justify-content: space-between;
}

.card-left {
  flex-grow: 1;
}

.card-left h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.main-value,
.secondary-value {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.value-amount {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.value-amount.negative {
  color: #f5222d;
}

.game-card {
  background-color: #e8f5fe;
}

.game-icon {
  color: #1890ff;
}

.deposit-card {
  background-color: #e6f7ff;
}

.deposit-icon {
  color: #13c2c2;
}

.activity-card {
  background-color: #fcf0e5;
}

.activity-icon {
  color: #fa8c16;
}

.cost-card {
  background-color: #f9e9e9;
}

.cost-icon {
  color: #f5222d;
}

.member-card {
  background-color: #f6f6f6;
}

.member-icon {
  color: #4c5c68;
}

.members-info {
  width: 100%;
}

.member-stat {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.member-stat div:first-child {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.vip-section {
  margin-bottom: 24px;
}

.vip-card {
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
}

.vip-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.vip-card.active {
  background-color: #1890ff;
  color: white;
}

.vip-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.vip-value {
  font-size: 24px;
  font-weight: bold;
}

.query-section {
  margin-bottom: 24px;
}
</style>

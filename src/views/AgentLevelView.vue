<template>
  <div class="agent-level-page">
    <div class="page-header">
      <h1>代理層級</h1>
      <div class="page-tools">
        <div class="page-breadcrumb">代理管理>代理層級</div>
      </div>
    </div>

    <n-grid :cols="24" :x-gap="24">
      <!-- 左側代理層級卡片 -->
      <n-grid-item :span="12">
        <n-card title="代理層級列表" class="level-list-card">
          <div class="search-wrapper">
            <n-input
              v-model:value="searchKeyword"
              placeholder="請輸入關鍵字搜尋"
              clearable
              @update:value="handleSearch"
            >
              <template #prefix>
                <n-icon><SearchIcon /></n-icon>
              </template>
            </n-input>
          </div>

          <div class="level-hierarchy">
            <h3>代理層級架構圖</h3>
            <div class="hierarchy-chart">
              <n-tree
                block-line
                :data="hierarchyTreeData"
                :default-expanded-keys="expandedKeys"
                :render-label="renderTreeLabel"
                selectable
              />
            </div>
          </div>

          <n-divider />

          <n-space vertical>
            <n-card
              v-for="level in filteredAgentLevels"
              :key="level.id"
              class="level-card"
              :class="{ active: activeLevel === level.id }"
              @click="setActiveLevel(level.id)"
            >
              <n-grid :cols="24">
                <n-grid-item :span="16">
                  <div class="level-info">
                    <h3 v-html="highlightKeyword(level.name)"></h3>
                    <div class="level-stats">
                      <div class="stat-item">
                        <span class="label">代理數量：</span>
                        <span class="value">{{ level.agentCount }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="label">佣金比例：</span>
                        <span class="value">{{ level.commission }}%</span>
                      </div>
                    </div>
                  </div>
                </n-grid-item>
                <n-grid-item :span="8" class="level-actions">
                  <n-space justify="end">
                    <n-button type="primary" size="small" @click.stop="editLevel(level)">
                      編輯
                    </n-button>
                    <n-button type="error" size="small" @click.stop="deleteLevel(level)">
                      刪除
                    </n-button>
                  </n-space>
                </n-grid-item>
              </n-grid>
            </n-card>
            <n-button type="primary" block @click="showAddLevelModal = true">
              新增代理層級
            </n-button>
          </n-space>
        </n-card>
      </n-grid-item>

      <!-- 右側設定代理卡片 -->
      <n-grid-item :span="12">
        <n-card title="代理層級設定" class="agent-setting-card">
          <n-form
            ref="formRef"
            :model="formModel"
            :rules="rules"
            label-placement="left"
            label-width="120"
          >
            <n-form-item label="選擇推廣網址" path="promotionUrl">
              <n-select
                v-model:value="formModel.promotionUrl"
                :options="promotionUrlOptions"
                placeholder="請選擇推廣網址"
              />
            </n-form-item>

            <n-form-item label="狀態" path="status">
              <n-switch v-model:value="formModel.status" />
            </n-form-item>

            <n-form-item label="建立代理" path="createAgent">
              <n-switch v-model:value="formModel.createAgent" disabled />
            </n-form-item>

            <n-form-item label="直屬會員登入" path="memberLogin">
              <n-switch v-model:value="formModel.memberLogin" />
            </n-form-item>

            <n-form-item label="會員註冊" path="memberRegister">
              <n-switch v-model:value="formModel.memberRegister" />
            </n-form-item>

            <n-form-item label="暱稱" path="nickname">
              <n-input v-model:value="formModel.nickname" placeholder="請輸入暱稱" />
            </n-form-item>

            <n-form-item label="代理佔成" path="commission">
              <n-input-number
                v-model:value="formModel.commission"
                :min="0"
                :max="100"
                :precision="2"
                placeholder="請輸入佣金比例"
              >
                <template #suffix>%</template>
              </n-input-number>
            </n-form-item>

            <n-form-item label="建立時間">
              <div class="info-text">{{ formModel.createTime || '尚未建立' }}</div>
            </n-form-item>

            <n-form-item label="登入時間">
              <div class="info-text">{{ formModel.loginTime || '尚未登入' }}</div>
            </n-form-item>

            <n-form-item>
              <n-space justify="end">
                <n-button @click="resetForm">重置</n-button>
                <n-button type="primary" @click="submitForm">保存</n-button>
              </n-space>
            </n-form-item>
          </n-form>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 新增層級彈窗 -->
    <n-modal v-model:show="showAddLevelModal" preset="dialog" title="新增代理層級">
      <n-form
        ref="addFormRef"
        :model="addFormModel"
        :rules="rules"
        label-placement="left"
        label-width="100"
      >
        <n-form-item label="層級名稱" path="name">
          <n-input v-model:value="addFormModel.name" placeholder="請輸入層級名稱" />
        </n-form-item>
        <n-form-item label="佣金比例" path="commission">
          <n-input-number
            v-model:value="addFormModel.commission"
            :min="0"
            :max="100"
            :precision="2"
            placeholder="請輸入佣金比例"
          >
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="最低入金" path="minDeposit">
          <n-input-number
            v-model:value="addFormModel.minDeposit"
            :min="0"
            :precision="0"
            placeholder="請輸入最低入金金額"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showAddLevelModal = false">取消</n-button>
          <n-button type="primary" @click="submitAddForm">確定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue'
import { useMessage } from 'naive-ui'
import type { FormInst, TreeOption } from 'naive-ui'
import { SearchOutline as SearchIcon } from '@vicons/ionicons5'

const message = useMessage()

// 代理層級數據
interface AgentLevel {
  id: number
  name: string
  agentCount: number
  commission: number
  parentId?: number | null
}

const agentLevels = ref<AgentLevel[]>([
  { id: 1, name: 'VIP代理', agentCount: 10, commission: 30, parentId: null },
  { id: 2, name: '高級代理', agentCount: 25, commission: 25, parentId: 1 },
  { id: 3, name: '普通代理', agentCount: 50, commission: 20, parentId: 2 },
  { id: 4, name: '初級代理', agentCount: 120, commission: 15, parentId: 3 },
])

// 搜尋相關
const searchKeyword = ref('')
const handleSearch = () => {
  // 搜尋邏輯
}

// 過濾出符合關鍵字的代理層級
const filteredAgentLevels = computed(() => {
  if (!searchKeyword.value) return agentLevels.value

  return agentLevels.value.filter((level) =>
    level.name.toLowerCase().includes(searchKeyword.value.toLowerCase()),
  )
})

// 高亮關鍵字
const highlightKeyword = (text: string) => {
  if (!searchKeyword.value) return text

  const regex = new RegExp(searchKeyword.value, 'gi')
  return text.replace(regex, (match) => `<span class="highlight">${match}</span>`)
}

// 層級架構樹
const expandedKeys = ref(['1'])

// 將代理層級數據轉換為樹狀結構
const buildTreeData = (items: AgentLevel[], parentId: number | null = null): TreeOption[] => {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      key: item.id.toString(),
      label: item.name,
      children: buildTreeData(items, item.id),
    }))
}

const hierarchyTreeData = computed(() => buildTreeData(agentLevels.value))

// 渲染樹節點標籤，實現高亮功能
const renderTreeLabel = ({ option }: { option: TreeOption }) => {
  if (!searchKeyword.value) return option.label

  const label = option.label as string
  if (label.toLowerCase().includes(searchKeyword.value.toLowerCase())) {
    return h('span', {
      innerHTML: highlightKeyword(label),
    })
  }

  return label
}

// 當前選中的層級
const activeLevel = ref(1)
const setActiveLevel = (id: number) => {
  activeLevel.value = id
  // 找到選中的層級數據並更新表單
  const level = agentLevels.value.find((l) => l.id === id)
  if (level) {
    formModel.nickname = level.name
    formModel.commission = level.commission
    formModel.createTime = '2024-04-10 10:30:45'
    formModel.loginTime = '2024-04-15 14:25:38'
  }
}

// 推廣網址選項
const promotionUrlOptions = [
  { label: 'https://agent.example.com/promo1', value: 'promo1' },
  { label: 'https://agent.example.com/promo2', value: 'promo2' },
  { label: 'https://agent.example.com/promo3', value: 'promo3' },
]

// 表單相關
const formRef = ref<FormInst | null>(null)
const formModel = reactive({
  promotionUrl: null,
  status: true,
  createAgent: false,
  memberLogin: true,
  memberRegister: true,
  nickname: '',
  commission: 0,
  createTime: '',
  loginTime: '',
})

// 新增表單相關
const addFormRef = ref<FormInst | null>(null)
const addFormModel = reactive({
  name: '',
  commission: 0,
  minDeposit: 0,
})

const showAddLevelModal = ref(false)

// 表單驗證規則
const rules = {
  name: {
    required: true,
    message: '請輸入層級名稱',
    trigger: 'blur',
  },
  commission: {
    required: true,
    type: 'number',
    message: '請輸入佣金比例',
    trigger: ['blur', 'change'],
  },
  minDeposit: {
    required: true,
    type: 'number',
    message: '請輸入最低入金金額',
    trigger: ['blur', 'change'],
  },
  nickname: {
    required: true,
    message: '請輸入暱稱',
    trigger: 'blur',
  },
  promotionUrl: {
    required: true,
    message: '請選擇推廣網址',
    trigger: ['blur', 'change'],
  },
}

// 編輯層級
const editLevel = (level: AgentLevel) => {
  formModel.nickname = level.name
  formModel.commission = level.commission
  formModel.createTime = '2024-04-10 10:30:45'
  formModel.loginTime = '2024-04-15 14:25:38'
  message.success('開始編輯層級')
}

// 刪除層級
const deleteLevel = (level: AgentLevel) => {
  const index = agentLevels.value.findIndex((l) => l.id === level.id)
  if (index > -1) {
    agentLevels.value.splice(index, 1)
    message.success('刪除成功')
  }
}

// 重置表單
const resetForm = () => {
  formRef.value?.restoreValidation()
  Object.assign(formModel, {
    promotionUrl: null,
    status: true,
    createAgent: false,
    memberLogin: true,
    memberRegister: true,
    nickname: '',
    commission: 0,
    createTime: '',
    loginTime: '',
  })
}

// 提交表單
const submitForm = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      message.success('保存成功')
    }
  })
}

// 提交新增表單
const submitAddForm = () => {
  addFormRef.value?.validate((errors) => {
    if (!errors) {
      // 生成新的層級ID
      const newId = Math.max(...agentLevels.value.map((l) => l.id)) + 1

      // 將新層級添加到列表
      agentLevels.value.push({
        id: newId,
        name: addFormModel.name,
        commission: addFormModel.commission,
        agentCount: 0,
        parentId: activeLevel.value,
      })

      message.success('新增成功')
      showAddLevelModal.value = false

      // 重置新增表單
      Object.assign(addFormModel, {
        name: '',
        commission: 0,
        minDeposit: 0,
      })
    }
  })
}
</script>

<style scoped>
.agent-level-page {
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

.search-wrapper {
  margin-bottom: 16px;
}

.level-hierarchy {
  margin-bottom: 20px;
}

.level-hierarchy h3 {
  margin-bottom: 12px;
  font-size: 16px;
}

.hierarchy-chart {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 12px;
  background-color: #fafafa;
}

.level-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.level-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.level-card.active {
  border: 1px solid #1890ff;
}

.level-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.level-stats {
  color: #666;
}

.stat-item {
  margin-bottom: 4px;
}

.stat-item .label {
  margin-right: 8px;
}

.stat-item .value {
  font-weight: bold;
  color: #1890ff;
}

.level-actions {
  display: flex;
  align-items: center;
}

.agent-setting-card {
  min-height: 600px;
}

.info-text {
  color: #666;
  line-height: 1.5;
}

:deep(.highlight) {
  background-color: #ffeaa7;
  font-weight: bold;
  padding: 0 2px;
}
</style>

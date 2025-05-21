<template>
  <div class="dashboard">
    <n-space vertical>
      <n-card title="後台管理系統範例">
        <n-grid :cols="24" :x-gap="12">
          <n-grid-item :span="8">
            <n-card title="數據統計">
              <n-statistic label="訪問量" :value="1234" />
            </n-card>
          </n-grid-item>
          <n-grid-item :span="8">
            <n-card title="任務管理">
              <n-progress type="circle" :percentage="80" />
            </n-card>
          </n-grid-item>
          <n-grid-item :span="8">
            <n-card title="通知">
              <n-badge :value="5" type="success">
                <n-button>消息</n-button>
              </n-badge>
            </n-card>
          </n-grid-item>
        </n-grid>

        <n-divider />

        <n-h2>數據列表</n-h2>
        <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />

        <n-divider />

        <n-h2>表單範例</n-h2>
        <n-form
          ref="formRef"
          :model="formModel"
          :rules="rules"
          label-placement="left"
          label-width="auto"
        >
          <n-form-item label="名稱" path="name">
            <n-input v-model:value="formModel.name" placeholder="請輸入名稱" />
          </n-form-item>
          <n-form-item label="類型" path="type">
            <n-select
              v-model:value="formModel.type"
              :options="typeOptions"
              placeholder="請選擇類型"
            />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="handleSubmit">提交</n-button>
          </n-form-item>
        </n-form>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMessage } from 'naive-ui'
import { NButton } from 'naive-ui'

const message = useMessage()

// 表格數據
const columns = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: '名稱',
    key: 'name',
  },
  {
    title: '狀態',
    key: 'status',
  },
]

const tableData = [
  { id: 1, name: '項目 A', status: '進行中' },
  { id: 2, name: '項目 B', status: '已完成' },
  { id: 3, name: '項目 C', status: '待處理' },
]

const pagination = {
  pageSize: 10,
}

// 表單數據
const formRef = ref(null)
const formModel = reactive({
  name: '',
  type: null,
})

const typeOptions = [
  { label: '類型 A', value: 'a' },
  { label: '類型 B', value: 'b' },
  { label: '類型 C', value: 'c' },
]

const rules = {
  name: {
    required: true,
    message: '請輸入名稱',
    trigger: 'blur',
  },
  type: {
    required: true,
    message: '請選擇類型',
    trigger: ['blur', 'change'],
  },
}

const handleSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      message.success('提交成功')
    } else {
      message.error('請檢查表單填寫')
    }
  })
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
</style>

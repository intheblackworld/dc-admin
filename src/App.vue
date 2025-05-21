<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { NMessageProvider, NDialogProvider, NConfigProvider, NLoadingBarProvider } from 'naive-ui'
import SideMenu from './components/SideMenu.vue'
import { onMounted } from 'vue'
import { isLoggedIn } from './lib/api'

const router = useRouter()

// 全局檢查用戶是否已登入
onMounted(() => {
  // 檢查用戶是否已登入
  if (!isLoggedIn() && window.location.pathname !== '/login') {
    router.push('/login')
  }
})
</script>

<template>
  <n-config-provider>
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-message-provider>
          <div class="admin-layout">
            <SideMenu v-if="isLoggedIn()" class="admin-sidebar" />
            <div class="admin-content">
              <RouterView />
            </div>
          </div>
        </n-message-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, 'Microsoft YaHei', sans-serif;
  background-color: #f0f2f5;
  color: #333;
}

.admin-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.admin-sidebar {
  flex-shrink: 0;
  z-index: 10;
}

.admin-content {
  overflow-x: hidden;
  width: 100%;
}
</style>

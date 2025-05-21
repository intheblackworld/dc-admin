<template>
  <div class="side-menu">
    <div class="logo-container">
      <h2 class="logo">代理 - {{ username }}</h2>
    </div>

    <n-menu
      :options="menuOptions"
      :indent="18"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :default-expanded-keys="defaultExpandedKeys"
      mode="vertical"
      v-model:value="activeKey"
    />
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  HomeOutline as HomeIcon,
  PeopleOutline as AgentIcon,
  PersonOutline as MemberIcon,
  DocumentTextOutline as ReportIcon,
  SearchOutline as SearchIcon,
  CashOutline as CashIcon,
  WalletOutline as WalletIcon,
  NotificationsOutline as AnnouncementIcon,
  ShieldOutline as RoleIcon,
} from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import type { Component } from 'vue'

// 模擬用戶數據
const username = ref('yt6404')

// 路由
const router = useRouter()

// 活動菜單項
const activeKey = ref<string | null>('home')

// 默認展開的菜單
const defaultExpandedKeys = ref<string[]>([])

// 渲染圖標
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

// 菜單項點擊處理
const handleMenuClick = (key: string, path: string) => {
  router.push(path)
}

// 菜單配置
const menuOptions: MenuOption[] = [
  {
    label: '首頁',
    key: 'home',
    icon: renderIcon(HomeIcon),
    onClick: () => handleMenuClick('home', '/'),
  },
  {
    label: '代理管理',
    key: 'agent',
    icon: renderIcon(AgentIcon),
    children: [
      {
        label: '代理層級',
        key: 'agent-level',
        onClick: () => handleMenuClick('agent-level', '/agent-level'),
      },
    ],
  },
  {
    label: '會員管理',
    key: 'member',
    icon: renderIcon(MemberIcon),
    children: [
      {
        label: '會員帳號',
        key: 'member-account',
        onClick: () => handleMenuClick('member-account', '/member-account'),
      },
      {
        label: '管理員帳號',
        key: 'admin-account',
        onClick: () => handleMenuClick('admin-account', '/admin-account'),
      },
    ],
  },
  {
    label: '公告管理',
    key: 'announcement',
    icon: renderIcon(AnnouncementIcon),
    onClick: () => handleMenuClick('announcement', '/announcement'),
  },
  {
    label: '角色管理',
    key: 'role',
    icon: renderIcon(RoleIcon),
    onClick: () => handleMenuClick('role', '/role'),
  },
  {
    label: '報表管理',
    key: 'report',
    icon: renderIcon(ReportIcon),
    children: [
      {
        label: '遊戲記錄',
        key: 'game-record',
        onClick: () => handleMenuClick('game-record', '/game-record'),
      },
      {
        label: '拆帳報表',
        key: 'split-report',
        onClick: () => handleMenuClick('split-report', '/split-report'),
      },
      {
        label: '帳務報表',
        key: 'finance-report',
        onClick: () => handleMenuClick('finance-report', '/finance-report'),
      },
    ],
  },
  {
    label: '各式查詢',
    key: 'query',
    icon: renderIcon(SearchIcon),
    children: [
      {
        label: '訂單查詢',
        key: 'order-query',
        onClick: () => handleMenuClick('order-query', '/order-query'),
      },
    ],
  },
  {
    label: 'GWS入台彩登入',
    key: 'gws-login',
    icon: renderIcon(CashIcon),
    onClick: () => handleMenuClick('gws-login', '/gws-login'),
  },
  {
    label: '匯出清單',
    key: 'export-list',
    icon: renderIcon(WalletIcon),
    onClick: () => handleMenuClick('export-list', '/export-list'),
  },
]

console.log(menuOptions, 'menuOptions')
</script>

<style scoped>
.side-menu {
  height: 100vh;
  background-color: #2c3e50;
  color: white;
  width: 210px;
}

.logo-container {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  margin: 0;
  font-size: 16px;
  color: white;
}

:deep(.n-menu) {
  background-color: #2c3e50 !important;
}

:deep(.n-menu-item-content) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.n-menu-item-content--selected) {
  color: white !important;
  background-color: #3498db !important;
}

:deep(.n-submenu-children) {
  background-color: #243342 !important;
}

:deep(.n-menu-item-content-header),
:deep(.n-menu-item-content__icon),
:deep(.n-menu-item-content__arrow) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.n-menu-item-content::before) {
  left: 0 !important;
  right: 0 !important;
  border-radius: 0 !important;
}

:deep(.n-menu .n-menu-item-content.n-menu-item-content--selected::before) {
  background-color: #516572 !important;
  left: 0 !important;
  right: 0 !important;
  border-radius: 0 !important;
}

:deep(.n-menu-item-content:not(.n-menu-item-content--disabled):hover::before) {
  background-color: #384858 !important;
  left: 0 !important;
  right: 0 !important;
  border-radius: 0 !important;
}
</style>

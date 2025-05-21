import axios from 'axios'
import router from '../router'

// 從環境變數讀取 API 基本 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://admin-api.dcocos.top'

// 定義接口類型
export interface LoginResponse {
  status: number
  message: string
  data: {
    admin_id: number
    account_name: string
    role_id: number
    token: string
  }
}

export interface DailyStatisticItem {
  stat_date: string
  total_bet_amount: number
  game_profit: number
  deposit_total: number
  withdraw_total: number
  event_cost: number
  rebate_total: number
  bonus_rebate: number
  new_user_count: number
  new_agent_count: number
  first_deposit_count: number
  vip1_count: number
  vip2_count: number
  vip3_count: number
  vip4_count: number
  vip5_count: number
  vip6_count: number
  vip7_count: number
  vip8_count: number
  vip9_count: number
  vip10_count: number
}

export interface DailyStatisticResponse {
  status: number
  message: string
  data: {
    total: number
    details: DailyStatisticItem[]
  }
}

// 公告相關類型定義
export interface Announcement {
  id: string
  title: string
  category: string
  date_type: string
  start_time: string
  end_time: string
  content: string
  admin_id: string
  admin_name: string
  created_at: string
  updated_at: string
  status?: string
}

export interface AnnouncementListResponse {
  status: number
  message: string
  data: {
    total: number
    list: Announcement[]
  }
}

export interface AnnouncementResponse {
  status: number
  message: string
  data: Announcement
}

// 會員相關類型定義
export interface Member {
  uid: string
  account_name: string
  nick_name: string
  phone_num: string
  id_card_number: string
  agent_id: string
  vip_level: string
  risk_level: string
  register_time: string
  last_login_at: string
  account_status?: string // 1: 正常, 2: 封號
}

export interface MemberListResponse {
  status: number
  message: string
  data: {
    total: number
    list: Member[]
  }
}

export interface MemberResponse {
  code: number
  message: string
  data: Member
}

// 角色管理相關API
export interface Role {
  id: string
  name: string
  description?: string
  status: string
  created_at?: string
  updated_at?: string
}

// API 響應類型定義
export interface ApiResponse<T = unknown> {
  status: number
  message: string
  data: T
}

// 創建 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// 添加請求攔截器
api.interceptors.request.use(
  (config) => {
    // 從 localStorage 獲取 token
    // config.headers['Content-Type'] = 'application/json'
    // config.headers['Accept'] = 'application/json'
    // config.headers['Allow-Control-Allow-Origin'] = '*'
    const token = localStorage.getItem('token')
    if (token) {
      // 添加到請求頭
      // config.headers['Authorization'] = `Bearer ${token}`

      // 添加到查詢參數
      if (config.params) {
        // 如果已有查詢參數，添加 token 到其中
        config.params.token = token
      } else {
        // 如果沒有查詢參數，創建一個包含 token 的參數對象
        config.params = { token }
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 添加響應攔截器
api.interceptors.response.use(
  (response) => {
    if (response.data.status === 9001 || response.data.status === 9002) {
      // 未授權，清除 token 並重定向到登入頁面
      localStorage.removeItem('token')
      localStorage.removeItem('admin_id')
      localStorage.removeItem('account_name')
      localStorage.removeItem('role_id')
      router.push('/login')
    }
    return response.data
  },
  (error) => {
    // console.log(error)
    // if (error.response && (error.response.status === 9001 || error.response.status === 9002)) {
    //   // 未授權，清除 token 並重定向到登入頁面
    //   localStorage.removeItem('token')
    //   localStorage.removeItem('admin_id')
    //   localStorage.removeItem('account_name')
    //   localStorage.removeItem('role_id')
    //   // 使用 router 而不是直接修改 window.location
    //   router.push('/login')
    // }
    return Promise.reject(error)
  },
)

// 登入函數
export const login = (account_name: string, password: string): Promise<LoginResponse> => {
  return api.get('/api.php', {
    params: {
      request: 'login',
      account_name,
      password,
    },
  })
}

// 登出函數
export const logout = () => {
  // 清除本地存儲的用戶信息
  localStorage.removeItem('token')
  localStorage.removeItem('admin_id')
  localStorage.removeItem('account_name')
  localStorage.removeItem('role_id')
}

// 獲取首頁每日統計數據
export const getDailyStatistics = (
  startDate: string,
  endDate: string,
): Promise<DailyStatisticResponse> => {
  return api.get('/api.php', {
    params: {
      request: 'daily_statistic_find',
      start_date: startDate,
      end_date: endDate,
    },
  })
}

// 公告管理相關 API

// 創建公告
export const createAnnouncement = (
  title: string,
  content: string,
  category: string,
  date_type: string,
  start_time: string,
  end_time: string,
): Promise<AnnouncementResponse> => {
  return api.get('/api.php', {
    params: {
      request: 'announcement_create',
      title,
      content,
      category,
      date_type,
      start_time,
      end_time,
    },
  })
}

// 啟用/禁用公告
export const toggleAnnouncementStatus = (
  id: string,
  status: string,
): Promise<AnnouncementResponse> => {
  return api.get('/api.php', {
    params: {
      request: 'announcement_enable',
      id,
      status,
    },
  })
}

// 獲取公告詳情
export const getAnnouncementDetail = (id: string): Promise<AnnouncementResponse> => {
  return api.get('/api.php', {
    params: {
      request: 'announcement_find',
      id,
    },
  })
}

// 獲取公告列表
export const getAnnouncementList = (
  page: number = 1,
  page_limit: number = 10,
  title?: string,
  category?: number,
  date_type?: string,
): Promise<AnnouncementListResponse> => {
  return api.get('/api.php', {
    params: {
      request: 'announcement_get',
      page,
      page_limit,
      ...(title && { title }),
      ...(category && { category }),
      ...(date_type && { date_type }),
    },
  })
}

// 更新公告
export const updateAnnouncement = (
  id: number,
  title: string,
  content: string,
  category: string,
  date_type: string,
  start_time: string,
  end_time: string,
): Promise<AnnouncementResponse> => {
  return api.get('/api.php', {
    params: {
      request: 'announcement_update',
      id,
      title,
      content,
      category,
      date_type,
      start_time,
      end_time,
    },
  })
}

// 會員管理相關 API

// 獲取會員列表
export const getMemberList = (params: {
  page?: number
  page_size?: number
  account_status?: string
  account_name?: string
  nick_name?: string
  phone_num?: string
  id_card_number?: string
  real_name?: string
  agent_id?: string
  vip_level?: string
  risk_level?: string
  register_time_start?: string
  register_time_end?: string
  last_login_at_start?: string
  last_login_at_end?: string
}): Promise<MemberListResponse> => {
  return api.get('/api.php', {
    params: {
      request: 'user_get',
      ...params,
    },
  })
}

// 啟用/禁用會員
export const toggleMemberStatus = (
  uid: string,
  account_status: string,
): Promise<{ status: number; message: string }> => {
  return api.get('/api.php', {
    params: {
      request: 'user_enable',
      uid,
      account_status,
    },
  })
}

// 檢查是否已登入
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('token')
}

// 獲取角色列表
export async function getRoleList(
  page = 1,
  page_limit = 10,
): Promise<ApiResponse<{ list: Role[]; total: number }>> {
  return api.get('/api.php', {
    params: {
      request: 'auth_role_get',
      page,
      page_limit,
    },
  })
}

// 獲取單個角色詳情
export async function getRoleDetail(id: string): Promise<ApiResponse<Role>> {
  return api.get('/api.php', {
    params: {
      request: 'auth_role_find',
      id,
    },
  })
}

// 創建角色
export async function createRole(
  name: string,
  description = '',
  status = '1',
): Promise<ApiResponse> {
  return api.get('/api.php', {
    params: {
      request: 'auth_role_create',
      name,
      description,
      status,
    },
  })
}

// 更新角色
export async function updateRole(
  id: string,
  name: string,
  description = '',
  status: string,
): Promise<ApiResponse> {
  return api.get('/api.php', {
    params: {
      request: 'auth_role_update',
      id,
      name,
      description,
      status,
    },
  })
}

// 刪除角色
export async function deleteRole(id: string): Promise<ApiResponse> {
  return api.get('/api.php', {
    params: {
      request: 'auth_role_delete',
      id,
    },
  })
}

// 管理員帳號相關類型和API

// 管理員帳號類型定義
export interface Admin {
  id: string
  account_name: string
  role_id: string
  status: string
  is_test: string
  create_time: string
  update_time: string
}

// 創建管理員帳號
export async function createAdmin(
  account_name: string,
  password: string,
  role_id: string,
): Promise<ApiResponse> {
  return api.get('/api.php', {
    params: {
      request: 'auth_admin_create',
      account_name,
      password,
      role_id,
    },
  })
}

// 啟用/禁用管理員
export async function toggleAdminStatus(id: string, status: string): Promise<ApiResponse> {
  return api.get('/api.php', {
    params: {
      request: 'auth_admin_enable',
      id,
      status,
    },
  })
}

// 查詢管理員帳號
export async function getAdminDetail(id: string): Promise<ApiResponse<Admin>> {
  return api.get('/api.php', {
    params: {
      request: 'auth_admin_find',
      id,
    },
  })
}

// 獲取管理員帳號列表
export async function getAdminList(
  params: {
    page?: number
    page_limit?: number
    account_name?: string
    role_id?: string
    status?: string
  } = {},
): Promise<ApiResponse<{ list: Admin[]; total: number }>> {
  return api.get('/api.php', {
    params: {
      request: 'auth_admin_get',
      ...params,
    },
  })
}

// 開啟/關閉管理員 Google 驗證
export async function toggleAdminGoogleAuth(id: string, status: string): Promise<ApiResponse> {
  return api.get('/api.php', {
    params: {
      request: 'auth_admin_open_google',
      id,
      status,
    },
  })
}

// 更新管理員帳號
export async function updateAdmin(
  id: string,
  password: string = '',
  role_id: string = '',
  status: string = '',
): Promise<ApiResponse> {
  return api.get('/api.php', {
    params: {
      request: 'auth_admin_update',
      id,
      ...(password && { password }),
      ...(role_id && { role_id }),
      ...(status && { status }),
    },
  })
}

export default api

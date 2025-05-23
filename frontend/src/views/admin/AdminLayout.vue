<template>
  <div class="admin-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <div class="logo">
          <h2>招生系统管理</h2>
        </div>
        <el-menu
          :router="true"
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><el-icon-menu /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/admin/applications">
            <el-icon><el-icon-document /></el-icon>
            <span>申请列表</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><el-icon-setting /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主要内容区域 -->
      <el-container>
        <!-- 顶部导航 -->
        <el-header>
          <div class="header-left">
            <el-button text @click="toggleSidebar">
              <el-icon><el-icon-fold /></el-icon>
            </el-button>
          </div>
          <div class="header-right">
            <span class="username">{{ currentUser?.name || '管理员' }}</span>
            <el-dropdown trigger="click" @command="handleCommand">
              <span class="el-dropdown-link">
                <el-avatar :size="32" :src="avatarUrl">{{ userInitials }}</el-avatar>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 内容区域 -->
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCurrentUser, logout } from '@/api/auth'

export default defineComponent({
  name: 'AdminLayout',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const sidebarCollapsed = ref(false)
    const currentUser = ref(getCurrentUser())
    
    const activeMenu = computed(() => {
      return route.path
    })
    
    const userInitials = computed(() => {
      return currentUser.value?.name?.substring(0, 1) || 'A'
    })
    
    const avatarUrl = computed(() => {
      return '' // 这里可以放置默认头像URL
    })
    
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
    
    const handleCommand = (command: string) => {
      if (command === 'logout') {
        logout()
        router.push('/login')
      }
    }
    
    onMounted(() => {
      if (!currentUser.value) {
        router.push('/login')
      }
    })
    
    return {
      activeMenu,
      sidebarCollapsed,
      currentUser,
      userInitials,
      avatarUrl,
      toggleSidebar,
      handleCommand
    }
  }
})
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
}

.el-menu {
  border-right: none;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  background-color: #263445;
}

.logo h2 {
  margin: 0;
  font-size: 16px;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-right {
  display: flex;
  align-items: center;
}

.username {
  margin-right: 12px;
  font-size: 14px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.el-dropdown-link {
  cursor: pointer;
}
</style> 
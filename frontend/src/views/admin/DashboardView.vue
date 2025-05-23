<template>
  <div class="dashboard-container">
    <h1>仪表盘</h1>
    
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="(item, index) in statistics" :key="index">
        <el-card class="stat-card">
          <div class="stat-title">{{ item.title }}</div>
          <div class="stat-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="recent-applications">
      <template #header>
        <div class="card-header">
          <h3>最近申请</h3>
          <el-button type="primary" size="small" @click="goToApplications">查看所有</el-button>
        </div>
      </template>
      
      <el-table :data="recentApplications" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="gender" label="性别" width="80"></el-table-column>
        <el-table-column prop="schoolDistrict" label="所属区域"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="text" @click="viewApplication(scope.row.id)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getStatistics, getApplications } from '@/api/admin'

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    
    const statistics = ref([
      { title: '待审核', value: 0, color: '#E6A23C' },
      { title: '审核中', value: 0, color: '#409EFF' },
      { title: '已录取', value: 0, color: '#67C23A' },
      { title: '已拒绝', value: 0, color: '#F56C6C' }
    ])
    
    const recentApplications = ref([])
    
    const getStatusType = (status: string) => {
      switch (status) {
        case 'pending': return 'warning'
        case 'reviewing': return 'primary'
        case 'approved': return 'success'
        case 'rejected': return 'danger'
        default: return 'info'
      }
    }
    
    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending': return '待审核'
        case 'reviewing': return '审核中'
        case 'approved': return '已录取'
        case 'rejected': return '已拒绝'
        default: return '未知'
      }
    }
    
    const viewApplication = (id: number) => {
      router.push(`/admin/applications/${id}`)
    }
    
    const goToApplications = () => {
      router.push('/admin/applications')
    }
    
    const fetchData = async () => {
      try {
        loading.value = true
        
        // 获取统计数据
        const statsRes = await getStatistics()
        statistics.value[0].value = statsRes.data.pendingApplications || 0
        statistics.value[1].value = statsRes.data.reviewingApplications || 0
        statistics.value[2].value = statsRes.data.approvedApplications || 0
        statistics.value[3].value = statsRes.data.rejectedApplications || 0
        
        // 获取最近的申请
        const applicationsRes = await getApplications({ page: 1, limit: 5 })
        recentApplications.value = applicationsRes.data.students || []
      } catch (error) {
        console.error('获取数据失败', error)
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchData()
    })
    
    return {
      loading,
      statistics,
      recentApplications,
      getStatusType,
      getStatusText,
      viewApplication,
      goToApplications
    }
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stat-card {
  text-align: center;
  margin-bottom: 20px;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.recent-applications {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}
</style> 
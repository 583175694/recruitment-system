<template>
  <div class="application-detail-container">
    <div class="page-header">
      <el-page-header @back="goBack" title="学生申请表">
        <template #content>
          <span class="page-title">申请详情 #{{ applicationId }}</span>
        </template>
      </el-page-header>
    </div>
    
    <div v-loading="loading" v-if="application">
      <!-- 基本信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <h3><el-icon><User /></el-icon> 基本信息</h3>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="姓名">{{ application.name }}</el-descriptions-item>
              <el-descriptions-item label="性别">{{ application.gender }}</el-descriptions-item>
              <el-descriptions-item label="身份证号">{{ application.idNumber }}</el-descriptions-item>
              <el-descriptions-item label="出生年月">{{ formatDate(application.birthDate, false) }}</el-descriptions-item>
              <el-descriptions-item label="民族">{{ application.ethnicity }}</el-descriptions-item>
              <el-descriptions-item label="毕业学校">{{ application.graduationSchool }}</el-descriptions-item>
              <el-descriptions-item label="家庭住址" :span="2">{{ application.homeAddress }}</el-descriptions-item>
              <el-descriptions-item label="申请时间">{{ formatDate(application.createdAt) }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 监护人信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <h3><el-icon><Phone /></el-icon> 监护人信息</h3>
          </div>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="监护人姓名">{{ application.guardianName }}</el-descriptions-item>
          <el-descriptions-item label="与学生关系">{{ application.guardianRelation }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ application.guardianContact }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
    
    <div v-else-if="!loading" class="empty-state">
      <el-empty description="未找到申请信息" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Phone } from '@element-plus/icons-vue';
import { getApplication } from '@/api/admin';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const application = ref(null);

// 获取申请ID
const applicationId = computed(() => {
  return route.params.id;
});

// 格式化日期
const formatDate = (dateString: string, showTime = true) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (showTime) {
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  }
};

// 返回上一页
const goBack = () => {
  router.push('/admin/applications');
};

// 加载申请详情
const loadApplicationDetail = async () => {
  try {
    loading.value = true;
    const response = await getApplication(Number(applicationId.value));
    application.value = response.data;
  } catch (error) {
    console.error('获取申请详情失败', error);
    ElMessage.error('获取申请详情失败');
  } finally {
    loading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadApplicationDetail();
});
</script>

<style scoped>
.application-detail-container {
  padding: 20px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 18px;
  font-weight: bold;
}

.info-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.info-card:hover {
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-state {
  margin-top: 50px;
  text-align: center;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .application-detail-container {
    padding: 15px;
  }

  .page-header {
    padding: 10px;
  }

  .page-title {
    font-size: 16px;
  }

  .card-header h3 {
    font-size: 15px;
  }
}
</style>

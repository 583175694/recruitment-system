<template>
  <div class="application-detail-container">
    <div class="page-header">
      <el-page-header @back="goBack" :title="getStatusText(application?.status || '')">
        <template #content>
          <span class="page-title">申请详情 #{{ applicationId }}</span>
        </template>
      </el-page-header>
    </div>
    
    <div v-loading="loading" v-if="application">
      <!-- 操作区域 -->
      <el-card class="action-card">
        <div class="action-buttons">
          <el-button-group v-if="application.status === 'pending' || application.status === 'reviewing'">
            <el-button type="success" @click="handleStatusChange('approved')" size="large">
              <el-icon><Check /></el-icon> 批准申请
            </el-button>
            <el-button type="danger" @click="handleStatusChange('rejected')" size="large">
              <el-icon><Close /></el-icon> 拒绝申请
            </el-button>
          </el-button-group>
          <span class="status-tag">
            <el-tag :type="getStatusType(application.status)" size="large" effect="dark">
              {{ getStatusText(application.status) }}
            </el-tag>
          </span>
        </div>
        
        <div v-if="application.reviewComments" class="review-comments">
          <h4>审核意见：</h4>
          <p>{{ application.reviewComments }}</p>
        </div>
      </el-card>
      
      <!-- 基本信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <h3><el-icon><User /></el-icon> 基本信息</h3>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <div class="student-photo-container">
              <div class="student-photo" v-if="application.photo">
                <img :src="getPhotoUrl(application.photo)" alt="学生照片" />
              </div>
              <div v-else class="no-photo">
                <el-icon><Avatar /></el-icon>
                <span>无照片</span>
              </div>
            </div>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="16">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="姓名">{{ application.name }}</el-descriptions-item>
              <el-descriptions-item label="性别">{{ application.gender }}</el-descriptions-item>
              <el-descriptions-item label="身份证号">{{ application.idNumber }}</el-descriptions-item>
              <el-descriptions-item label="毕业学校">{{ application.graduationSchool }}</el-descriptions-item>
              <el-descriptions-item label="所属区域">{{ application.schoolDistrict }}</el-descriptions-item>
              <el-descriptions-item label="申请时间">{{ formatDate(application.createdAt) }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 考试成绩 -->
      <el-card class="info-card" v-if="application.examScores && application.examScores.length > 0">
        <template #header>
          <div class="card-header">
            <h3><el-icon><Reading /></el-icon> 考试成绩</h3>
          </div>
        </template>
        
        <div v-for="(examScore, index) in application.examScores" :key="index" class="exam-score-item">
          <el-divider>
            <el-tag type="info" effect="plain" size="large">{{ examScore.gradeLevel }}</el-tag>
          </el-divider>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="16">
              <el-table :data="examScore.subjects || []" style="width: 100%" border stripe highlight-current-row>
                <el-table-column prop="name" label="科目" width="120">
                  <template #default="scope">
                    <strong>{{ scope.row.name }}</strong>
                  </template>
                </el-table-column>
                <el-table-column prop="scoreType" label="成绩类型" width="120">
                  <template #default="scope">
                    <el-tag size="small" :type="scope.row.scoreType === 'numeric' ? 'primary' : 'success'">
                      {{ scope.row.scoreType === 'numeric' ? '分数' : '等级' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="成绩" min-width="100">
                  <template #default="scope">
                    <span class="score-value">
                      {{ scope.row.scoreType === 'numeric' ? scope.row.score : scope.row.grade }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
            
            <el-col :xs="24" :sm="8">
              <div class="certificate-container" v-if="examScore.certificateImage">
                <h4>成绩证明：</h4>
                <el-image 
                  :src="getCertificateUrl(examScore.certificateImage)" 
                  :preview-src-list="[getCertificateUrl(examScore.certificateImage)]" 
                  fit="contain"
                  class="score-certificate"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>加载失败</span>
                    </div>
                  </template>
                </el-image>
              </div>
              <div v-else class="no-certificate">
                <el-empty description="无证明材料" :image-size="60"></el-empty>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
      
      <!-- 荣誉成就 -->
      <el-card class="info-card" v-if="application.achievements && application.achievements.length > 0">
        <template #header>
          <div class="card-header">
            <h3><el-icon><Trophy /></el-icon> 荣誉成就</h3>
          </div>
        </template>
        
        <div v-for="(achievement, index) in application.achievements" :key="index" class="achievement-item">
          <el-divider>
            <el-tag type="warning" effect="plain" size="large">荣誉 {{ index + 1 }}</el-tag>
          </el-divider>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="荣誉名称">
                  <strong>{{ achievement.name }}</strong>
                </el-descriptions-item>
                <el-descriptions-item label="荣誉级别">
                  <el-tag :type="getAchievementLevelType(achievement.level)">
                    {{ achievement.level }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="获奖日期">{{ formatDate(achievement.awardDate, false) }}</el-descriptions-item>
                <el-descriptions-item label="描述">{{ achievement.description || '无描述' }}</el-descriptions-item>
              </el-descriptions>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <div class="certificate-container" v-if="achievement.certificateImage">
                <h4>证书照片：</h4>
                <el-image 
                  :src="getCertificateUrl(achievement.certificateImage)" 
                  :preview-src-list="[getCertificateUrl(achievement.certificateImage)]" 
                  fit="contain"
                  class="achievement-certificate"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>加载失败</span>
                    </div>
                  </template>
                </el-image>
              </div>
              <div v-else class="no-certificate">
                <el-empty description="无证书照片" :image-size="60"></el-empty>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
      
      <!-- 家长信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <h3><el-icon><Phone /></el-icon> 家长信息</h3>
          </div>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="家长姓名">{{ application.parentName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ application.parentContact }}</el-descriptions-item>
          <el-descriptions-item label="工作单位" :span="2">{{ application.parentWorkplace }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
    
    <!-- 状态变更对话框 -->
    <el-dialog v-model="dialogVisible" :title="'更改申请状态为：' + getStatusText(targetStatus)">
      <el-form :model="reviewForm">
        <el-form-item label="审核意见" prop="reviewComments">
          <el-input v-model="reviewForm.reviewComments" type="textarea" rows="4" placeholder="请输入审核意见..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitStatusChange" :loading="submitLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Picture, Check, Close, User, Avatar, Phone, Reading, Trophy } from '@element-plus/icons-vue';
import { getApplication, updateApplicationStatus } from '@/api/admin';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const application = ref(null);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const targetStatus = ref('');

// 获取申请ID
const applicationId = computed(() => {
  return route.params.id;
});

// 审核表单
const reviewForm = reactive({
  reviewComments: ''
});

// 获取申请状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'reviewing': return 'primary';
    case 'approved': return 'success';
    case 'rejected': return 'danger';
    default: return 'info';
  }
};

// 获取申请状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return '待审核';
    case 'reviewing': return '审核中';
    case 'approved': return '已录取';
    case 'rejected': return '已拒绝';
    default: return '未知';
  }
};

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

// 获取照片URL
const getPhotoUrl = (path: string) => {
  return import.meta.env.VITE_API_BASE_URL + path;
};

// 获取证书URL
const getCertificateUrl = (path: string) => {
  return import.meta.env.VITE_API_BASE_URL + path;
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

// 处理状态变更
const handleStatusChange = (status: string) => {
  targetStatus.value = status;
  reviewForm.reviewComments = '';
  dialogVisible.value = true;
};

// 提交状态变更
const submitStatusChange = async () => {
  try {
    submitLoading.value = true;
    await updateApplicationStatus(
      Number(applicationId.value), 
      targetStatus.value, 
      reviewForm.reviewComments
    );
    ElMessage.success('申请状态更新成功');
    dialogVisible.value = false;
    await loadApplicationDetail(); // 重新加载申请详情
  } catch (error) {
    console.error('更新申请状态失败', error);
    ElMessage.error('更新申请状态失败');
  } finally {
    submitLoading.value = false;
  }
};

// 获取荣誉成就级别类型
const getAchievementLevelType = (level: string) => {
  switch (level) {
    case '国家级': return 'danger';
    case '省级': return 'warning';
    case '市级': return 'primary';
    case '校级': return 'success';
    default: return 'info';
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

.action-card {
  margin-bottom: 20px;
  background-color: #f8f9fa;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-photo-container {
  width: 100%;
  max-width: 200px;
  margin-bottom: 20px;
}

.student-photo {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.student-photo img {
  width: 100%;
  border-radius: 4px;
}

.certificate-thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.certificate-thumbnail:hover {
  transform: scale(1.05);
}

.achievement-certificate {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  transition: transform 0.3s;
}

.achievement-certificate:hover {
  transform: scale(1.02);
}

.score-certificate {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  transition: transform 0.3s;
}

.score-certificate:hover {
  transform: scale(1.02);
}

.certificate-container {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.certificate-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.certificate-container h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
}

.achievement-item {
  margin-bottom: 30px;
}

.exam-score-item {
  margin-bottom: 30px;
}

.no-certificate {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 150px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.no-photo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #909399;
  font-size: 14px;
}

.no-photo .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.review-comments {
  margin-top: 15px;
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 8px;
  border-left: 3px solid #67c23a;
}

.review-comments h4 {
  margin-top: 0;
  margin-bottom: 5px;
  color: #606266;
}

.review-comments p {
  margin: 0;
  color: #303133;
}

.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
}

.score-value {
  font-weight: bold;
  font-size: 16px;
}

.status-tag {
  align-self: flex-end;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .status-tag {
    align-self: flex-end;
  }
  
  .exam-score-item, .achievement-item {
    margin-bottom: 40px;
  }
  
  .certificate-container {
    margin-top: 20px;
  }
}
</style>

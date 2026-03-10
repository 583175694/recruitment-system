<template>
  <div class="detail-container" v-loading="loading">
    <el-card v-if="application">
      <template #header>
        <div class="card-header">
          <span>学生信息详情</span>
          <div class="header-actions">
            <el-button @click="goBack">返回</el-button>
            <el-button
              v-if="application.status === 'pending'"
              type="success"
              @click="handleApprove"
            >
              审核通过
            </el-button>
            <el-button
              v-if="application.status === 'pending'"
              type="danger"
              @click="handleReject"
            >
              驳回
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="提交时间" :span="2">
          {{ formatDate(application.submittedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="学生姓名">
          {{ application.studentName }}
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ application.gender }}
        </el-descriptions-item>
        <el-descriptions-item label="毕业学校" :span="2">
          {{ application.graduationSchool }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话" :span="2">
          {{ application.contactPhone }}
        </el-descriptions-item>
        <el-descriptions-item label="身份证号" :span="2">
          <span v-if="application.idCardNumber">{{ application.idCardNumber }}</span>
          <el-tag v-else type="info" size="small">未录入</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核状态" :span="2">
          <el-tag v-if="application.status === 'pending'" type="warning">待审核</el-tag>
          <el-tag v-else-if="application.status === 'approved'" type="success">已通过</el-tag>
          <el-tag v-else type="danger">已驳回</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h3>学生荣誉（4-6年级）</h3>
      <div class="honors-section">
        <el-card
          v-for="(honor, index) in application.honors"
          :key="index"
          class="honor-card"
        >
          <div class="honor-info">
            <p><strong>荣誉名称：</strong>{{ honor.name }}</p>
            <p><strong>获奖年级：</strong>{{ honor.grade }}</p>
          </div>
          <div class="honor-image">
            <el-image
              :src="getImageUrl(honor.imageUrl)"
              :preview-src-list="[getImageUrl(honor.imageUrl)]"
              fit="cover"
            />
          </div>
        </el-card>
      </div>

      <el-divider />

      <h3>成绩证明材料（选填）</h3>
      <div v-if="application.certificateImages && application.certificateImages.length > 0" class="certificates-section">
        <el-image
          v-for="(img, index) in application.certificateImages"
          :key="index"
          :src="getImageUrl(img)"
          :preview-src-list="application.certificateImages.map(i => getImageUrl(i))"
          fit="cover"
          class="certificate-image"
        />
      </div>
      <div v-else class="empty-text">
        <el-empty description="未上传成绩证明材料" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getApplicationDetail,
  approveApplication,
  rejectApplication,
  type H5Application,
} from '@/api/h5-application';

export default defineComponent({
  name: 'H5ApplicationDetailView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const loading = ref(false);
    const application = ref<H5Application | null>(null);

    const loadData = async () => {
      loading.value = true;
      try {
        const id = Number(route.params.id);
        application.value = await getApplicationDetail(id);
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '加载数据失败');
      } finally {
        loading.value = false;
      }
    };

    const handleApprove = async () => {
      try {
        await ElMessageBox.confirm('确认审核通过该申请？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });

        const id = Number(route.params.id);
        await approveApplication(id);
        ElMessage.success('审核通过');
        await loadData();
      } catch (error: any) {
        if (error !== 'cancel') {
          ElMessage.error(error.response?.data?.message || '操作失败');
        }
      }
    };

    const handleReject = async () => {
      try {
        await ElMessageBox.confirm('确认驳回该申请？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });

        const id = Number(route.params.id);
        await rejectApplication(id);
        ElMessage.success('已驳回');
        await loadData();
      } catch (error: any) {
        if (error !== 'cancel') {
          ElMessage.error(error.response?.data?.message || '操作失败');
        }
      }
    };

    const goBack = () => {
      router.back();
    };

    const getImageUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3031/recruitment-api/').replace(/\/$/, '');
      return `${API_BASE_URL}${url}`;
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleString('zh-CN');
    };

    onMounted(() => {
      loadData();
    });

    return {
      loading,
      application,
      handleApprove,
      handleReject,
      goBack,
      getImageUrl,
      formatDate,
    };
  },
});
</script>

<style scoped>
.detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

h3 {
  margin: 20px 0 10px;
  font-size: 16px;
}

.honors-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.honor-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.honor-info p {
  margin: 5px 0;
}

.honor-image {
  width: 100%;
  height: 200px;
}

.honor-image .el-image {
  width: 100%;
  height: 100%;
}

.certificates-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.certificate-image {
  width: 100%;
  height: 200px;
}

.empty-text {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}
</style>

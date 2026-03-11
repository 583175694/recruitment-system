<template>
  <div class="teacher-upload-container">
    <el-card class="header-card">
      <div class="header-content">
        <h2>教师上传简历</h2>
        <p class="subtitle">支持上传多张图片（多页简历），系统将自动 OCR 识别后整合录入家长提交记录</p>
      </div>
    </el-card>

    <el-card class="upload-card">
      <el-upload
        ref="uploadRef"
        class="resume-uploader"
        drag
        multiple
        :auto-upload="false"
        :limit="10"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :on-exceed="handleExceed"
        :file-list="fileList"
      >
        <div class="upload-area">
          <el-icon class="upload-icon"><upload-filled /></el-icon>
          <div class="upload-text">
            <p class="primary-text">拖拽简历图片到此处，或 <em>点击上传</em></p>
            <p class="hint-text">支持多张图片（多页简历），JPG / PNG / WEBP，单张不超过 10MB，最多 10 张</p>
          </div>
        </div>
      </el-upload>

      <div v-if="previewItems.length > 0" class="preview-section">
        <p class="preview-label">已选 {{ previewItems.length }} 张图片：</p>
        <div class="preview-grid">
          <div v-for="(item, idx) in previewItems" :key="item.uid" class="preview-item">
            <span class="page-badge">第 {{ idx + 1 }} 页</span>
            <img :src="item.url" class="preview-img" :alt="`第 ${idx + 1} 页`" />
            <span class="file-name">{{ item.name }}</span>
            <el-button class="remove-btn" type="danger" size="small" circle :icon="Close" @click="removePreview(idx)" />
          </div>
        </div>
      </div>

      <div class="action-bar">
        <el-button
          type="primary"
          size="large"
          :loading="uploading"
          :disabled="selectedFiles.length === 0"
          @click="handleUpload"
        >
          {{ uploading ? '识别处理中...' : `开始识别并录入（${selectedFiles.length} 张）` }}
        </el-button>
        <el-button size="large" @click="handleClear" :disabled="uploading">清空</el-button>
      </div>
    </el-card>

    <el-card v-if="currentJobId" class="status-card">
      <template #header><span>处理状态</span></template>
      <div v-if="jobStatus === 'processing'" class="status-processing">
        <el-icon class="rotating"><loading /></el-icon>
        <span>正在识别处理中，请稍候...</span>
        <el-button link type="primary" @click="pollStatus" style="margin-left:12px">手动刷新</el-button>
      </div>
      <div v-else-if="jobStatus === 'completed' && completedData" class="status-completed">
        <el-result icon="success" title="识别成功" sub-title="以下信息已录入家长提交记录，请核查" />
        <el-descriptions :column="2" border class="result-desc">
          <el-descriptions-item label="序号">{{ completedData.serialNumber || '—' }}</el-descriptions-item>
          <el-descriptions-item label="学生姓名">{{ completedData.studentName || '—' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ completedData.gender || '—' }}</el-descriptions-item>
          <el-descriptions-item label="毕业学校">{{ completedData.graduationSchool || '—' }}</el-descriptions-item>
          <el-descriptions-item label="所属区域">{{ completedData.schoolDistrict || '—' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ completedData.contactPhone || '—' }}</el-descriptions-item>
          <el-descriptions-item label="荣誉/证书" :span="2">
            <span v-if="!completedData.honors || completedData.honors.length === 0">—</span>
            <div v-else class="honors-list">
              <el-tag v-for="(h, i) in completedData.honors" :key="i" type="success" style="margin:2px 4px">
                {{ h.name }}{{ h.grade ? `（${h.grade}）` : '' }}
              </el-tag>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <div class="completed-actions">
          <el-button type="primary" @click="goToH5Applications">查看家长提交记录</el-button>
          <el-button @click="handleClear">继续上传</el-button>
        </div>
      </div>
    </el-card>

    <el-card v-if="uploadHistory.length > 0" class="history-card">
      <template #header><span>本次会话上传记录</span></template>
      <el-table :data="uploadHistory" style="width:100%">
        <el-table-column prop="filename" label="文件名" />
        <el-table-column prop="pageCount" label="页数" width="80" />
        <el-table-column prop="studentName" label="识别姓名" width="120" />
        <el-table-column prop="graduationSchool" label="毕业学校" />
        <el-table-column prop="contactPhone" label="联系电话" width="130" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'completed'" type="success">成功</el-tag>
            <el-tag v-else-if="row.status === 'processing'" type="warning">处理中</el-tag>
            <el-tag v-else type="danger">失败</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { UploadFilled, Loading, Close } from '@element-plus/icons-vue';
import { uploadResume, getJobStatus } from '@/api/teacher-upload';

interface PreviewItem {
  uid: string;
  name: string;
  url: string;
  file: File;
}

export default defineComponent({
  name: 'TeacherUploadView',
  components: { UploadFilled, Loading, Close },
  setup() {
    const router = useRouter();
    const uploadRef = ref();
    const fileList = ref<any[]>([]);
    const selectedFiles = ref<File[]>([]);
    const previewItems = ref<PreviewItem[]>([]);
    const uploading = ref(false);
    const currentJobId = ref('');
    const jobStatus = ref<'processing' | 'completed' | ''>('');
    const completedData = ref<any>(null);
    const uploadHistory = ref<any[]>([]);
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const handleFileChange = (file: any) => {
      // 同步 fileList 和 previewItems
      const existing = previewItems.value.find(p => p.uid === file.uid);
      if (!existing) {
        const url = URL.createObjectURL(file.raw);
        previewItems.value.push({ uid: file.uid, name: file.name, url, file: file.raw });
        selectedFiles.value.push(file.raw);
      }
    };

    const handleFileRemove = (file: any) => {
      const idx = previewItems.value.findIndex(p => p.uid === file.uid);
      if (idx >= 0) {
        URL.revokeObjectURL(previewItems.value[idx].url);
        previewItems.value.splice(idx, 1);
        selectedFiles.value.splice(idx, 1);
      }
    };

    const removePreview = (idx: number) => {
      URL.revokeObjectURL(previewItems.value[idx].url);
      const uid = previewItems.value[idx].uid;
      previewItems.value.splice(idx, 1);
      selectedFiles.value.splice(idx, 1);
      // 同步 el-upload 内部列表
      fileList.value = fileList.value.filter((f: any) => f.uid !== uid);
    };

    const handleExceed = () => {
      ElMessage.warning('最多上传 10 张图片');
    };

    const handleClear = () => {
      previewItems.value.forEach(p => URL.revokeObjectURL(p.url));
      previewItems.value = [];
      selectedFiles.value = [];
      fileList.value = [];
      currentJobId.value = '';
      jobStatus.value = '';
      completedData.value = null;
      stopPolling();
      uploadRef.value?.clearFiles();
    };

    const handleUpload = async () => {
      if (selectedFiles.value.length === 0) return;
      uploading.value = true;
      jobStatus.value = 'processing';
      completedData.value = null;

      const pageCount = selectedFiles.value.length;
      const firstFileName = selectedFiles.value[0].name;

      try {
        const result = await uploadResume([...selectedFiles.value]);
        currentJobId.value = result.jobId;
        ElMessage.success(`上传成功（${pageCount} 张），正在识别处理...`);

        const historyItem = {
          filename: pageCount > 1 ? `${firstFileName} 等 ${pageCount} 张` : firstFileName,
          pageCount,
          jobId: result.jobId,
          studentName: '识别中...',
          graduationSchool: '',
          contactPhone: '',
          status: 'processing',
        };
        uploadHistory.value.unshift(historyItem);
        startPolling(result.jobId, historyItem);
      } catch (err: any) {
        ElMessage.error(err.response?.data?.message || '上传失败，请重试');
        jobStatus.value = '';
      } finally {
        uploading.value = false;
      }
    };

    const startPolling = (jobId: string, historyItem: any) => {
      stopPolling();
      let attempts = 0;
      pollTimer = setInterval(async () => {
        attempts++;
        if (attempts > 60) { stopPolling(); ElMessage.warning('识别超时，请手动刷新'); return; }
        await checkJobStatus(jobId, historyItem);
      }, 3000);
    };

    const checkJobStatus = async (jobId: string, historyItem?: any) => {
      try {
        const res = await getJobStatus(jobId);
        if (res.status === 'completed') {
          stopPolling();
          jobStatus.value = 'completed';
          completedData.value = res.data;
          ElMessage.success('识别完成，已录入家长提交记录');
          if (historyItem) {
            historyItem.studentName = res.data?.studentName || '—';
            historyItem.graduationSchool = res.data?.graduationSchool || '—';
            historyItem.contactPhone = res.data?.contactPhone || '—';
            historyItem.status = 'completed';
          }
        }
      } catch { /* 继续轮询 */ }
    };

    const pollStatus = async () => {
      if (currentJobId.value) await checkJobStatus(currentJobId.value);
    };

    const stopPolling = () => {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    };

    const goToH5Applications = () => router.push('/admin/h5-applications');

    onUnmounted(() => {
      stopPolling();
      previewItems.value.forEach(p => URL.revokeObjectURL(p.url));
    });

    return {
      Close, uploadRef, fileList, selectedFiles, previewItems, uploading,
      currentJobId, jobStatus, completedData, uploadHistory,
      handleFileChange, handleFileRemove, removePreview, handleExceed,
      handleClear, handleUpload, pollStatus, goToH5Applications,
    };
  },
});
</script>

<style scoped>
.teacher-upload-container { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.header-content h2 { margin: 0 0 6px; font-size: 20px; font-weight: 600; }
.subtitle { margin: 0; color: #666; font-size: 14px; }
.resume-uploader { width: 100%; }
.upload-area { padding: 40px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.upload-icon { font-size: 64px; color: #409eff; }
.primary-text { margin: 0; font-size: 16px; color: #333; }
.primary-text em { color: #409eff; font-style: normal; cursor: pointer; }
.hint-text { margin: 6px 0 0; font-size: 13px; color: #999; }
.preview-section { margin-top: 20px; }
.preview-label { font-size: 14px; color: #555; margin-bottom: 12px; }
.preview-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.preview-item { position: relative; width: 160px; display: flex; flex-direction: column; align-items: center; border: 1px solid #ddd; border-radius: 8px; padding: 8px; background: #fafafa; }
.page-badge { position: absolute; top: 6px; left: 6px; background: #409eff; color: #fff; font-size: 11px; padding: 1px 6px; border-radius: 4px; }
.preview-img { width: 100%; height: 120px; object-fit: contain; border-radius: 4px; }
.file-name { font-size: 11px; color: #888; margin-top: 4px; word-break: break-all; text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.remove-btn { position: absolute; top: 4px; right: 4px; }
.action-bar { margin-top: 24px; display: flex; gap: 12px; }
.status-processing { display: flex; align-items: center; gap: 10px; font-size: 15px; color: #e6a23c; padding: 20px 0; }
.rotating { animation: spin 1s linear infinite; font-size: 20px; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.result-desc { margin-top: 0; }
.honors-list { display: flex; flex-wrap: wrap; gap: 4px; }
.completed-actions { margin-top: 20px; display: flex; gap: 12px; }
</style>

<template>
  <div class="qrcode-container">
    <el-card class="header-card">
      <div class="header-content">
        <h2>二维码管理</h2>
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          生成新二维码
        </el-button>
      </div>
    </el-card>

    <el-card v-if="activeQrCode" class="active-qrcode-card">
      <template #header>
        <div class="card-header">
          <span>当前有效二维码</span>
          <el-tag type="success">有效</el-tag>
        </div>
      </template>
      <div class="qrcode-content">
        <div class="qrcode-image">
          <canvas ref="qrCanvas" />
        </div>
        <div class="qrcode-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="生成时间">
              {{ formatDate(activeQrCode.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag type="success">有效</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="已提交数量">
              {{ activeQrCode.submissionCount }} 份
            </el-descriptions-item>
            <el-descriptions-item label="二维码链接">
              <el-text truncated style="max-width: 300px; font-size: 12px; color: #909399;">
                {{ h5Url }}
              </el-text>
            </el-descriptions-item>
          </el-descriptions>
          <div class="qrcode-actions">
            <el-button type="primary" @click="handleDownload">下载二维码</el-button>
            <el-button @click="viewSubmissions(activeQrCode.id)">查看提交记录</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-card v-else class="no-qrcode-card">
      <el-empty description="暂无有效二维码，请点击「生成新二维码」按钮生成">
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          立即生成
        </el-button>
      </el-empty>
    </el-card>

    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <span>历史二维码列表</span>
        </div>
      </template>
      <el-table :data="qrCodeList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="createdAt" label="生成时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="expiredAt" label="失效时间" width="200">
          <template #default="{ row }">
            {{ row.expiredAt ? formatDate(row.expiredAt) : '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">有效</el-tag>
            <el-tag v-else type="info">已失效</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submissionCount" label="提交数量" width="100" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewSubmissions(row.id)">
              查看记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import QRCode from 'qrcode';
import { generateQrCode, getActiveQrCode, getQrCodeList, type QrCode } from '@/api/qrcode';

export default defineComponent({
  name: 'QrCodeView',
  setup() {
    const router = useRouter();
    const generating = ref(false);
    const activeQrCode = ref<QrCode | null>(null);
    const qrCodeList = ref<QrCode[]>([]);
    const qrCanvas = ref<HTMLCanvasElement | null>(null);

    const getH5BaseUrl = () => {
      if (import.meta.env.VITE_H5_BASE_URL) return import.meta.env.VITE_H5_BASE_URL;
      // 取当前页面 # 之前的完整路径（含 /recruitment/index.html 等前缀）
      const href = window.location.href;
      const hashIndex = href.indexOf('#');
      return hashIndex !== -1 ? href.slice(0, hashIndex) : href;
    };

    const h5Url = computed(() => {
      if (!activeQrCode.value) return '';
      return `${getH5BaseUrl()}#/h5/apply?token=${activeQrCode.value.token}`;
    });

    const renderQrCode = async () => {
      if (!activeQrCode.value) return;
      await nextTick();
      if (!qrCanvas.value) return;
      await QRCode.toCanvas(qrCanvas.value, h5Url.value, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
    };

    const loadData = async () => {
      try {
        // 只读取当前有效二维码，不触发生成
        const active = await getActiveQrCode();
        activeQrCode.value = active;
        if (active) {
          await renderQrCode();
        }
        const list = await getQrCodeList();
        qrCodeList.value = list;
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '加载数据失败');
      }
    };

    const handleGenerate = async () => {
      if (activeQrCode.value) {
        try {
          await ElMessageBox.confirm(
            '生成新二维码后，当前二维码将立即失效，已张贴的二维码将无法使用。确认继续？',
            '注意',
            {
              confirmButtonText: '确认生成',
              cancelButtonText: '取消',
              type: 'warning',
            },
          );
        } catch {
          return;
        }
      }

      generating.value = true;
      try {
        const result = await generateQrCode();
        activeQrCode.value = result.qrCode;
        ElMessage.success('新二维码生成成功，旧二维码已失效');
        await renderQrCode();
        const list = await getQrCodeList();
        qrCodeList.value = list;
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '生成失败');
      } finally {
        generating.value = false;
      }
    };

    const handleDownload = () => {
      if (!qrCanvas.value) return;
      const dataUrl = qrCanvas.value.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qrcode-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ElMessage.success('下载成功');
    };

    const viewSubmissions = (qrCodeId: number) => {
      router.push({
        name: 'H5Applications',
        query: { qrCodeId },
      });
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleString('zh-CN');
    };

    onMounted(() => {
      loadData();
    });

    return {
      generating,
      activeQrCode,
      qrCodeList,
      qrCanvas,
      h5Url,
      handleGenerate,
      handleDownload,
      viewSubmissions,
      formatDate,
    };
  },
});
</script>

<style scoped>
.qrcode-container {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  font-size: 20px;
}

.active-qrcode-card {
  margin-bottom: 20px;
}

.no-qrcode-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.qrcode-content {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.qrcode-image {
  flex-shrink: 0;
}

.qrcode-image canvas {
  width: 300px;
  height: 300px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: block;
}

.qrcode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.qrcode-actions {
  display: flex;
  gap: 10px;
}

.history-card {
  margin-top: 20px;
}
</style>

<template>
  <div class="h5-applications-container">
    <el-card class="header-card">
      <div class="header-content">
        <h2>家长提交记录</h2>
      </div>
    </el-card>

    <el-card>
      <div class="filter-section">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="毕业学校">
            <el-input v-model="filterForm.school" placeholder="请输入学校名称" clearable />
          </el-form-item>
          <el-form-item label="提交日期">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleExport">导出Excel</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="applicationList" style="width: 100%" v-loading="loading">
        <el-table-column prop="submittedAt" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.submittedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="graduationSchool" label="毕业学校" width="200" />
        <el-table-column prop="contactPhone" label="联系电话" width="130" />
        <el-table-column prop="schoolDistrict" label="所属区域" width="120">
          <template #default="{ row }">
            {{ row.schoolDistrict || '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="serialNumber" label="序号" width="80">
          <template #default="{ row }">
            {{ row.serialNumber || '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="honors" label="荣誉数量" width="100">
          <template #default="{ row }">
            {{ row.honors ? row.honors.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="sourceType" label="来源" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.sourceType === 'teacher'" type="info">教师录入</el-tag>
            <el-tag v-else>家长提交</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === 'approved'" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已驳回</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getApplicationList, type H5Application } from '@/api/h5-application';

export default defineComponent({
  name: 'H5ApplicationsView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const loading = ref(false);
    const applicationList = ref<H5Application[]>([]);
    const filterForm = reactive({
      school: '',
      dateRange: [] as Date[],
    });
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0,
    });

    const loadData = async () => {
      loading.value = true;
      try {
        const params: any = {
          page: pagination.page,
          pageSize: pagination.pageSize,
        };

        if (filterForm.school) {
          params.school = filterForm.school;
        }

        if (filterForm.dateRange && filterForm.dateRange.length === 2) {
          params.startDate = filterForm.dateRange[0].toISOString();
          params.endDate = filterForm.dateRange[1].toISOString();
        }

        const result = await getApplicationList(params);
        applicationList.value = result.list;
        pagination.total = result.total;
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '加载数据失败');
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = () => {
      pagination.page = 1;
      loadData();
    };

    const handleReset = () => {
      filterForm.school = '';
      filterForm.dateRange = [];
      pagination.page = 1;
      loadData();
    };

    const handleSizeChange = (val: number) => {
      pagination.pageSize = val;
      loadData();
    };

    const handleCurrentChange = (val: number) => {
      pagination.page = val;
      loadData();
    };

    const viewDetail = (id: number) => {
      router.push({
        name: 'H5ApplicationDetail',
        params: { id },
      });
    };

    const handleExport = () => {
      ElMessage.info('导出功能开发中');
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleString('zh-CN');
    };

    onMounted(() => {
      loadData();
    });

    return {
      loading,
      applicationList,
      filterForm,
      pagination,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      viewDetail,
      handleExport,
      formatDate,
    };
  },
});
</script>

<style scoped>
.h5-applications-container {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.header-content h2 {
  margin: 0;
  font-size: 20px;
}

.filter-section {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

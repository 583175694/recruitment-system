<template>
  <div class="applications-container">
    <h1 class="page-title">申请列表</h1>
    
    <!-- 搜索和筛选区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.name" placeholder="请输入学生姓名" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="searchForm.idNumber" placeholder="请输入身份证号" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="性别" style="width: 200px">
          <el-select v-model="searchForm.gender" placeholder="请选择性别" clearable @clear="handleSearch" style="width: 100%">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
          <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 申请列表 -->
    <el-card class="application-list-card">
      <el-table :data="applications" style="width: 100%" v-loading="loading" border stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="idNumber" label="身份证号" width="180" />
        <el-table-column prop="ethnicity" label="民族" width="100" />
        <el-table-column prop="graduationSchool" label="毕业学校" min-width="150" />
        <el-table-column prop="guardianName" label="监护人" width="120" />
        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewApplication(scope.row.id)" :icon="View">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getApplications } from '@/api/admin';
import { Search, Refresh, View } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(false);
const applications = ref([]);

// 搜索表单
const searchForm = reactive({
  name: '',
  idNumber: '',
  gender: ''
});

// 监听搜索表单变化，实时更新UI
watch(() => [searchForm.gender], () => {
  // 防止表单值被清空后触发搜索
  if (searchForm.gender !== undefined) {
    handleSearch();
  }
});

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 加载申请列表
const loadApplications = async () => {
  try {
    loading.value = true;
    
    const params = {
      page: pagination.currentPage,
      limit: pagination.pageSize,
      ...searchForm
    };
    
    const response = await getApplications(params);
    applications.value = response.data.students || [];
    pagination.total = response.data.total || 0;
  } catch (error) {
    console.error('获取申请列表失败', error);
    ElMessage.error('获取申请列表失败');
  } finally {
    loading.value = false;
  }
};

// 查看申请详情
const viewApplication = (id: number) => {
  router.push(`/admin/applications/${id}`);
};

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1; // 重置到第一页
  loadApplications();
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = '';
  });
  handleSearch();
};

// 分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  loadApplications();
};

// 页码变化
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  loadApplications();
};

// 组件挂载时加载数据
onMounted(() => {
  loadApplications();
});
</script>

<style scoped>
.applications-container {
  padding: 20px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
  font-weight: 600;
  border-left: 4px solid #409eff;
  padding-left: 12px;
}

.search-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  border-radius: 8px;
}

.search-card:hover {
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.1);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.application-list-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  border-radius: 8px;
}

.application-list-card:hover {
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.1);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    width: 100%;
  }
  
  .el-table {
    font-size: 12px;
  }
  
  .el-button--small {
    padding: 5px 10px;
  }
  
  .pagination-container {
    justify-content: center;
  }
}
</style>

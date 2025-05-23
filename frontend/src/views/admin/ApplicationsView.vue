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
        <el-form-item label="学校区域" style="width: 200px">
          <el-select v-model="searchForm.schoolDistrict" placeholder="请选择学校区域" clearable @clear="handleSearch" style="width: 100%">
            <el-option label="海淀区" value="海淀区"></el-option>
            <el-option label="朝阳区" value="朝阳区"></el-option>
            <el-option label="东城区" value="东城区"></el-option>
            <el-option label="西城区" value="西城区"></el-option>
            <el-option label="丰台区" value="丰台区"></el-option>
            <el-option label="石景山区" value="石景山区"></el-option>
            <el-option label="其他区域" value="其他区域"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="申请状态" style="width: 200px">
          <el-select v-model="searchForm.status" placeholder="请选择申请状态" clearable @clear="handleSearch" style="width: 100%">
            <el-option label="待审核" value="pending"></el-option>
            <el-option label="审核中" value="reviewing"></el-option>
            <el-option label="已录取" value="approved"></el-option>
            <el-option label="已拒绝" value="rejected"></el-option>
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
        <el-table-column prop="graduationSchool" label="毕业学校" min-width="150" />
        <el-table-column prop="schoolDistrict" label="所属区域" width="120" />
        <el-table-column prop="status" label="申请状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="plain">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewApplication(scope.row.id)" :icon="View">查看</el-button>
            <el-button 
              type="success" 
              size="small" 
              v-if="scope.row.status === 'pending'"
              @click="changeStatus(scope.row.id, 'reviewing')"
              :icon="Edit"
            >
              开始审核
            </el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { getApplications, updateApplicationStatus } from '@/api/admin';
import { Search, Refresh, View, Edit } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(false);
const applications = ref([]);

// 搜索表单
const searchForm = reactive({
  name: '',
  idNumber: '',
  schoolDistrict: '',
  status: ''
});

// 监听搜索表单变化，实时更新UI
watch(() => [searchForm.schoolDistrict, searchForm.status], () => {
  // 防止表单值被清空后触发搜索
  if (searchForm.schoolDistrict !== undefined && searchForm.status !== undefined) {
    handleSearch();
  }
});

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
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

// 更改申请状态
const changeStatus = async (id: number, status: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要将申请状态更改为"${getStatusText(status)}"吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await updateApplicationStatus(id, status);
    ElMessage.success('状态更新成功');
    loadApplications(); // 重新加载数据
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('更新状态失败', error);
      ElMessage.error('更新状态失败');
    }
  }
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

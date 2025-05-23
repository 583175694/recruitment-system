<template>
  <div class="users-container">
    <h1>用户管理</h1>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="openCreateUserDialog">
        <el-icon><Plus /></el-icon> 创建新用户
      </el-button>
    </div>
    
    <!-- 用户列表 -->
    <el-card class="user-list-card">
      <el-table :data="users" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag 
              :type="scope.row.role === 'admin' ? 'danger' : 'primary'"
            >
              {{ scope.row.role === 'admin' ? '管理员' : '审核员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              :disabled="true"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small"
              :disabled="scope.row.role === 'admin' || scope.row.id === currentUser?.id"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 创建用户对话框 -->
    <el-dialog v-model="createUserDialogVisible" title="创建新用户" width="500px">
      <el-form 
        ref="createUserFormRef"
        :model="createUserForm" 
        :rules="createUserRules" 
        label-width="100px"
        status-icon
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createUserForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="createUserForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createUserForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="createUserForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="createUserForm.confirmPassword" type="password" placeholder="请确认密码" show-password />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="createUserForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="审核员" value="reviewer" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCreateUser" :loading="submitLoading">创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { createUser } from '@/api/admin';
import { getCurrentUser } from '@/api/auth';

const loading = ref(false);
const submitLoading = ref(false);
const users = ref([]);
const createUserDialogVisible = ref(false);
const createUserFormRef = ref();
const currentUser = ref(getCurrentUser());

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 创建用户表单
const createUserForm = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'reviewer'
});

// 创建用户表单校验规则
const createUserRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度应为4-20个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== createUserForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
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

// 模拟加载用户列表
const loadUsers = async () => {
  try {
    loading.value = true;
    
    // 这里应该调用实际的API，由于API可能还未实现，暂时使用模拟数据
    // const response = await getUsers({ page: pagination.currentPage, limit: pagination.pageSize });
    // users.value = response.data.users;
    // pagination.total = response.data.total;
    
    // 模拟数据
    setTimeout(() => {
      users.value = [
        {
          id: 1,
          username: 'admin',
          name: '系统管理员',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: '2023-01-01T08:00:00.000Z'
        },
        {
          id: 2,
          username: 'reviewer1',
          name: '审核员一',
          email: 'reviewer1@example.com',
          role: 'reviewer',
          createdAt: '2023-01-02T09:30:00.000Z'
        },
        {
          id: 3,
          username: 'reviewer2',
          name: '审核员二',
          email: 'reviewer2@example.com',
          role: 'reviewer',
          createdAt: '2023-01-03T14:15:00.000Z'
        }
      ];
      pagination.total = 3;
      loading.value = false;
    }, 500);
    
  } catch (error) {
    console.error('获取用户列表失败', error);
    ElMessage.error('获取用户列表失败');
    loading.value = false;
  }
};

// 打开创建用户对话框
const openCreateUserDialog = () => {
  // 重置表单
  Object.keys(createUserForm).forEach(key => {
    createUserForm[key] = '';
  });
  createUserForm.role = 'reviewer';
  
  createUserDialogVisible.value = true;
};

// 提交创建用户
const submitCreateUser = async () => {
  if (!createUserFormRef.value) return;
  
  await createUserFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitLoading.value = true;
        
        // 移除确认密码字段，仅发送需要的数据
        const { confirmPassword, ...userData } = createUserForm;
        
        await createUser(userData);
        ElMessage.success('用户创建成功');
        createUserDialogVisible.value = false;
        loadUsers(); // 重新加载用户列表
      } catch (error) {
        console.error('创建用户失败', error);
        ElMessage.error('创建用户失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  loadUsers();
};

// 页码变化
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  loadUsers();
};

// 组件挂载时加载数据
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.user-list-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

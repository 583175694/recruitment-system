<template>
  <div class="applications-container">
    <h1 class="page-title">申请列表</h1>

    <!-- 搜索和筛选区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="学生姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入学生姓名"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input
            v-model="searchForm.idNumber"
            placeholder="请输入身份证号"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="性别" style="width: 200px">
          <el-select
            v-model="searchForm.gender"
            placeholder="请选择性别"
            clearable
            @clear="handleSearch"
            style="width: 100%"
          >
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search"
            >搜索</el-button
          >
          <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
          <el-button
            type="success"
            @click="exportToExcel"
            :icon="Download"
            :loading="exportLoading"
            >导出Excel</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 申请列表 -->
    <el-card class="application-list-card">
      <el-table
        :data="applications"
        style="width: 100%"
        v-loading="loading"
        border
        stripe
        highlight-current-row
      >
        <el-table-column type="expand">
          <template #default="props">
            <el-card class="expanded-info" shadow="never">
              <el-row :gutter="20">
                <el-col :span="24">
                  <h4>家庭和联系信息</h4>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="家庭住址">{{
                      props.row.homeAddress || "未提供"
                    }}</el-descriptions-item>
                    <el-descriptions-item label="出生年月">{{
                      formatDate(props.row.birthDate, false) || "未提供"
                    }}</el-descriptions-item>
                    <el-descriptions-item label="监护人姓名">{{
                      props.row.guardianName || "未提供"
                    }}</el-descriptions-item>
                    <el-descriptions-item label="与学生关系">{{
                      props.row.guardianRelation || "未提供"
                    }}</el-descriptions-item>
                    <el-descriptions-item label="联系电话">{{
                      props.row.guardianContact || "未提供"
                    }}</el-descriptions-item>
                  </el-descriptions>
                </el-col>
              </el-row>
            </el-card>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="60" />
        <el-table-column prop="idNumber" label="身份证号" width="180" />
        <el-table-column prop="ethnicity" label="民族" width="80" />
        <el-table-column prop="birthDate" label="出生日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.birthDate, false) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="graduationSchool"
          label="毕业学校"
          min-width="150"
        />
        <el-table-column prop="homeAddress" label="家庭住址" min-width="200" />
        <el-table-column prop="guardianName" label="监护人" width="100" />
        <el-table-column prop="guardianRelation" label="关系" width="80" />
        <el-table-column prop="guardianContact" label="联系电话" width="120" />
        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row.id, scope.row.name)"
              :icon="Delete"
              >删除</el-button
            >
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

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
      center
    >
      <span
        >确定要删除
        <strong>{{ studentToDelete.name }}</strong>
        的申请记录吗？此操作不可恢复！</span
      >
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button
            type="danger"
            @click="confirmDelete"
            :loading="deleteLoading"
          >
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { getApplications, deleteApplication } from "@/api/admin";
import { Search, Refresh, Delete, Download } from "@element-plus/icons-vue";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

const router = useRouter();
const loading = ref(false);
const exportLoading = ref(false);
const applications = ref([]);

// 删除相关
const deleteDialogVisible = ref(false);
const deleteLoading = ref(false);
const studentToDelete = reactive({
  id: 0,
  name: "",
});

// 搜索表单
const searchForm = reactive({
  name: "",
  idNumber: "",
  gender: "",
});

// 监听搜索表单变化，实时更新UI
watch(
  () => [searchForm.gender],
  () => {
    // 防止表单值被清空后触发搜索
    if (searchForm.gender !== undefined) {
      handleSearch();
    }
  }
);

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 格式化日期
const formatDate = (dateString: string, showTime = true) => {
  if (!dateString) return "";
  const date = new Date(dateString);

  if (showTime) {
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
};

// 加载申请列表
const loadApplications = async () => {
  try {
    loading.value = true;

    const params = {
      page: pagination.currentPage,
      limit: pagination.pageSize,
      ...searchForm,
    };

    const response = await getApplications(params);
    applications.value = response.data.students || [];
    pagination.total = response.data.total || 0;
  } catch (error) {
    console.error("获取申请列表失败", error);
    ElMessage.error("获取申请列表失败");
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
  Object.keys(searchForm).forEach((key) => {
    (searchForm as any)[key] = "";
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

// 处理删除
const handleDelete = (id: number, name: string) => {
  studentToDelete.id = id;
  studentToDelete.name = name;
  deleteDialogVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
  try {
    deleteLoading.value = true;
    await deleteApplication(studentToDelete.id);
    ElMessage.success(`已成功删除${studentToDelete.name}的申请记录`);
    deleteDialogVisible.value = false;
    // 重新加载数据
    loadApplications();
  } catch (error) {
    console.error("删除申请记录失败", error);
    ElMessage.error("删除申请记录失败");
  } finally {
    deleteLoading.value = false;
  }
};

// 导出Excel
const exportToExcel = async () => {
  try {
    if (applications.value.length === 0) {
      ElMessage.warning("没有数据可导出");
      return;
    }

    exportLoading.value = true;

    // 如果当前只加载了部分数据，询问是否导出所有数据
    let dataToExport = [];

    if (pagination.total > applications.value.length) {
      const confirmResult = await ElMessageBox.confirm(
        `当前页面只显示了${applications.value.length}条数据，共有${pagination.total}条数据。是否导出全部数据？`,
        "导出确认",
        {
          confirmButtonText: "导出全部",
          cancelButtonText: "仅导出当前页",
          type: "warning",
        }
      ).catch(() => "cancel");

      if (confirmResult === "confirm") {
        // 导出全部数据，需要重新请求不分页的数据
        const params = {
          ...searchForm,
          page: 1,
          limit: pagination.total, // 获取所有数据
        };

        const response = await getApplications(params);
        dataToExport = response.data.students || [];
      } else {
        // 仅导出当前页数据
        dataToExport = applications.value;
      }
    } else {
      // 当前数据已是全部，直接导出
      dataToExport = applications.value;
    }

    // 定义Excel表头和对应的数据字段
    const headers = [
      { header: "姓名", key: "name" },
      { header: "性别", key: "gender" },
      { header: "身份证号", key: "idNumber" },
      {
        header: "出生年月",
        key: "birthDate",
        formatter: (val: string) => (val ? formatDate(val, false) : ""),
      },
      { header: "民族", key: "ethnicity" },
      { header: "监护人", key: "guardianName" },
      { header: "家庭住址", key: "homeAddress" },
      { header: "小学毕业学校", key: "graduationSchool" },
    ];

    // 转换数据格式
    const excelData = dataToExport.map((item: any) => {
      const row: any = {};
      headers.forEach((header) => {
        if (header.formatter) {
          row[header.header] = header.formatter(item[header.key]);
        } else {
          row[header.header] = item[header.key];
        }
      });
      return row;
    });

    // 创建工作簿和工作表
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 设置列宽
    const columnsWidth = headers.map(() => ({ wch: 15 }));
    worksheet["!cols"] = columnsWidth;

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, "申请列表");

    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const excelFile = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const date = new Date();
    const fileName = `申请列表_${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}.xlsx`;

    FileSaver.saveAs(excelFile, fileName);

    ElMessage.success("导出成功");
  } catch (error) {
    console.error("导出Excel失败", error);
    ElMessage.error("导出Excel失败");
  } finally {
    exportLoading.value = false;
  }
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

.expanded-info {
  padding: 10px;
  margin: 10px;
  background-color: #f9f9f9;
}

.expanded-info h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #606266;
  border-left: 3px solid #409eff;
  padding-left: 10px;
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

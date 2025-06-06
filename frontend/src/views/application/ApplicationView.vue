<template>
  <div class="application-container">
    <div class="application-header">
      <h1>学生个人信息表</h1>
      <!-- 表单进度提示 -->
      <div class="progress-container">
        <el-progress
          :percentage="formProgress"
          :stroke-width="6"
          :show-text="false"
          class="form-progress"
        />
        <div class="progress-text">完成度: {{ formProgress }}%</div>
      </div>
    </div>

    <!-- 自动保存提示 -->
    <el-alert
      v-if="autoSaveStatus"
      :title="autoSaveStatus"
      :type="autoSaveType"
      :closable="false"
      class="auto-save-alert"
      show-icon
    />

    <el-card class="application-card">
      <template #header>
        <div class="card-header">
          <h2>基本信息</h2>
          <div class="required-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>标有 * 的为必填项</span>
          </div>
        </div>
      </template>

      <el-form
        ref="applicationForm"
        :model="form"
        :rules="rules"
        :label-position="formLabelPosition"
        :status-icon="true"
        :validate-on-rule-change="false"
        @validate="onFormValidate"
      >
        <!-- 学生基本信息 -->
        <h3>学生信息</h3>
        <el-form-item label="姓名" prop="name" required>
          <el-input
            v-model="form.name"
            placeholder="请输入学生姓名"
            maxlength="20"
            show-word-limit
            clearable
          />
          <ErrorMessage :errors="formErrors" field="name" />
        </el-form-item>

        <el-form-item label="性别" prop="gender" required>
          <el-radio-group v-model="form.gender">
            <el-radio :value="'男'">男</el-radio>
            <el-radio :value="'女'">女</el-radio>
          </el-radio-group>
          <ErrorMessage :errors="formErrors" field="gender" />
        </el-form-item>

        <el-form-item label="身份证号" prop="idNumber" required>
          <el-input
            v-model="form.idNumber"
            placeholder="请输入身份证号"
            maxlength="18"
            clearable
          />
          <ErrorMessage :errors="formErrors" field="idNumber" />
        </el-form-item>

        <el-form-item label="出生年月" prop="birthDate" required>
          <el-date-picker
            v-model="form.birthDate"
            type="date"
            placeholder="选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            style="width: 100%"
            clearable
          />
          <ErrorMessage :errors="formErrors" field="birthDate" />
        </el-form-item>

        <el-form-item label="民族" prop="ethnicity" required>
          <el-select
            v-model="form.ethnicity"
            placeholder="请选择民族"
            style="width: 100%"
            clearable
            filterable
          >
            <el-option label="汉族" value="汉族" />
            <el-option label="蒙古族" value="蒙古族" />
            <el-option label="回族" value="回族" />
            <el-option label="藏族" value="藏族" />
            <el-option label="维吾尔族" value="维吾尔族" />
            <el-option label="苗族" value="苗族" />
            <el-option label="彝族" value="彝族" />
            <el-option label="壮族" value="壮族" />
            <el-option label="布依族" value="布依族" />
            <el-option label="朝鲜族" value="朝鲜族" />
            <el-option label="满族" value="满族" />
            <el-option label="侗族" value="侗族" />
            <el-option label="瑶族" value="瑶族" />
            <el-option label="白族" value="白族" />
            <el-option label="土家族" value="土家族" />
            <el-option label="哈尼族" value="哈尼族" />
            <el-option label="哈萨克族" value="哈萨克族" />
            <el-option label="傣族" value="傣族" />
            <el-option label="黎族" value="黎族" />
            <el-option label="傈僳族" value="傈僳族" />
            <el-option label="佤族" value="佤族" />
            <el-option label="其他" value="其他" />
          </el-select>
          <ErrorMessage :errors="formErrors" field="ethnicity" />
        </el-form-item>

        <el-form-item label="毕业学校" prop="graduationSchool" required>
          <el-input
            v-model="form.graduationSchool"
            placeholder="请输入毕业小学名称"
            maxlength="50"
            show-word-limit
            clearable
          />
          <ErrorMessage :errors="formErrors" field="graduationSchool" />
        </el-form-item>

        <el-form-item label="家庭住址" prop="homeAddress" required>
          <el-input
            v-model="form.homeAddress"
            placeholder="请输入详细家庭住址"
            maxlength="200"
            show-word-limit
            clearable
          />
          <ErrorMessage :errors="formErrors" field="homeAddress" />
        </el-form-item>

        <!-- 监护人信息 -->
        <h3>监护人信息</h3>
        <el-form-item label="监护人姓名" prop="guardianName" required>
          <el-input
            v-model="form.guardianName"
            placeholder="请输入监护人姓名"
            maxlength="20"
            show-word-limit
            clearable
          />
          <ErrorMessage :errors="formErrors" field="guardianName" />
        </el-form-item>

        <el-form-item label="与学生关系" prop="guardianRelation" required>
          <el-select
            v-model="form.guardianRelation"
            placeholder="请选择与学生的关系"
            style="width: 100%"
            clearable
          >
            <el-option label="父亲" value="父亲" />
            <el-option label="母亲" value="母亲" />
            <el-option label="祖父" value="祖父" />
            <el-option label="祖母" value="祖母" />
            <el-option label="外祖父" value="外祖父" />
            <el-option label="外祖母" value="外祖母" />
            <el-option label="其他亲属" value="其他亲属" />
            <el-option label="法定监护人" value="法定监护人" />
          </el-select>
          <ErrorMessage :errors="formErrors" field="guardianRelation" />
        </el-form-item>

        <el-form-item label="联系电话" prop="guardianContact" required>
          <el-input
            v-model="form.guardianContact"
            placeholder="请输入联系电话"
            maxlength="11"
            clearable
          />
          <div class="input-tip">请输入11位手机号码</div>
          <ErrorMessage :errors="formErrors" field="guardianContact" />
        </el-form-item>

        <!-- 表单底部按钮 -->
        <el-form-item class="submit-button">
          <el-button
            type="primary"
            @click="submitForm"
            :loading="loading"
            size="large"
            :icon="Document"
          >
            {{ loading ? "提交中..." : "提交个人信息表" }}
          </el-button>
          <el-button @click="resetForm" size="large" :icon="RefreshLeft">
            重置表单
          </el-button>
          <el-button
            @click="saveDraft"
            :loading="draftSaving"
            size="large"
            :icon="FolderOpened"
          >
            {{ draftSaving ? "保存中..." : "保存草稿" }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  onUnmounted,
  computed,
  watch,
  nextTick,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { createApplication } from "@/api/application";
import { debounce } from "@/utils/debounce";
import ErrorMessage from "@/components/ErrorMessage.vue";
import {
  Document,
  RefreshLeft,
  FolderOpened,
  InfoFilled,
} from "@element-plus/icons-vue";

// 类型定义
interface FormData {
  name: string;
  gender: string;
  idNumber: string;
  birthDate: string;
  ethnicity: string;
  graduationSchool: string;
  homeAddress: string;
  guardianName: string;
  guardianRelation: string;
  guardianContact: string;
}

export default defineComponent({
  name: "ApplicationView",
  components: {
    ErrorMessage,
    Document,
    RefreshLeft,
    FolderOpened,
    InfoFilled,
  },
  setup() {
    const form = reactive<FormData>({
      name: "",
      gender: "",
      idNumber: "",
      birthDate: "",
      ethnicity: "",
      graduationSchool: "",
      homeAddress: "",
      guardianName: "",
      guardianRelation: "",
      guardianContact: "",
    });

    // 状态管理
    const loading = ref(false);
    const draftSaving = ref(false);
    const applicationForm = ref<any>(null);
    const formErrors = ref<Record<string, string[]>>({});
    const autoSaveStatus = ref("");
    const autoSaveType = ref<"success" | "warning" | "error">("success");

    // 响应式处理
    const windowWidth = ref(window.innerWidth);
    const isMobile = computed(() => windowWidth.value < 768);
    const formLabelPosition = computed(() =>
      isMobile.value ? "top" : "right"
    );

    // 表单进度计算
    const formProgress = computed(() => {
      let totalFields = 0;
      let filledFields = 0;

      // 基本信息和监护人信息
      const allFields = [
        "name",
        "gender",
        "idNumber",
        "birthDate",
        "ethnicity",
        "graduationSchool",
        "homeAddress",
        "guardianName",
        "guardianRelation",
        "guardianContact",
      ];

      totalFields = allFields.length;
      filledFields = allFields.filter(
        (field) => form[field as keyof FormData]
      ).length;

      return Math.round((filledFields / totalFields) * 100);
    });

    // 完整的表单验证规则
    const rules = {
      name: [
        { required: true, message: "请输入学生姓名", trigger: "blur" },
        { min: 2, max: 20, message: "姓名长度应为2-20个字符", trigger: "blur" },
      ],
      gender: [{ required: true, message: "请选择性别", trigger: "change" }],
      idNumber: [
        { required: true, message: "请输入身份证号", trigger: "blur" },
        {
          pattern:
            /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]$/,
          message: "身份证号格式不正确",
          trigger: "blur",
        },
      ],
      birthDate: [
        { required: true, message: "请选择出生日期", trigger: "change" },
      ],
      ethnicity: [{ required: true, message: "请选择民族", trigger: "change" }],
      graduationSchool: [
        { required: true, message: "请输入毕业学校", trigger: "blur" },
        { max: 50, message: "学校名称不能超过50个字符", trigger: "blur" },
      ],
      homeAddress: [
        { required: true, message: "请输入家庭住址", trigger: "blur" },
        { max: 200, message: "地址不能超过200个字符", trigger: "blur" },
      ],
      guardianName: [
        { required: true, message: "请输入监护人姓名", trigger: "blur" },
        { min: 2, max: 20, message: "姓名长度应为2-20个字符", trigger: "blur" },
      ],
      guardianRelation: [
        { required: true, message: "请选择与学生的关系", trigger: "change" },
      ],
      guardianContact: [
        { required: true, message: "请输入联系电话", trigger: "blur" },
        {
          pattern: /^1[3-9]\d{9}$/,
          message: "手机号格式不正确",
          trigger: "blur",
        },
      ],
    };

    // 日期验证：不能选择未来日期
    const disabledDate = (time: Date) => {
      return time.getTime() > Date.now();
    };

    // 自动保存功能
    const autoSave = debounce(() => {
      if (formProgress.value > 10) {
        // 只有在填写了一定内容后才自动保存
        saveDraft(true);
      }
    }, 3000);

    // 监听表单变化
    watch(
      form,
      () => {
        formErrors.value = {}; // 清空错误信息
        autoSave();
      },
      { deep: true }
    );

    // 响应式窗口大小
    const handleResize = debounce(() => {
      windowWidth.value = window.innerWidth;
    }, 200);

    // 表单验证监听
    const onFormValidate = (
      prop: string,
      isValid: boolean,
      message: string
    ) => {
      if (isValid) {
        // 如果验证通过，清除该字段的错误信息
        if (formErrors.value[prop]) {
          delete formErrors.value[prop];
        }
      }
    };

    // 提交表单
    const submitForm = async () => {
      if (!applicationForm.value) return;

      try {
        loading.value = true;
        formErrors.value = {};

        // 表单验证
        await applicationForm.value.validate();

        // 处理表单数据
        const formToSubmit = { ...form };

        // 提交数据
        await createApplication(formToSubmit);

        ElMessage.success("个人信息表提交成功！");

        // 清除本地存储的草稿
        localStorage.removeItem("application_draft");

        // 可以跳转到成功页面
        // router.push('/application/success');
      } catch (error: any) {
        console.error("提交失败", error);

        if (error.response?.data?.validationErrors) {
          const errors = error.response.data.validationErrors || {};

          // 确保错误格式正确
          Object.keys(errors).forEach((key) => {
            if (!Array.isArray(errors[key])) {
              errors[key] = [errors[key]];
            }
          });

          formErrors.value = errors;

          ElMessage.error("表单验证失败，请检查输入内容");

          // 滚动到第一个错误
          nextTick(() => {
            const firstErrorEl = document.querySelector(".is-error");
            if (firstErrorEl) {
              firstErrorEl.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          });
        } else {
          ElMessage.error(
            error.response?.data?.message || "提交失败，请稍后重试"
          );
        }
      } finally {
        loading.value = false;
      }
    };

    // 保存草稿
    const saveDraft = async (isAuto = false) => {
      try {
        if (!isAuto) {
          draftSaving.value = true;
        }

        // 保存到本地存储
        localStorage.setItem(
          "application_draft",
          JSON.stringify({
            form,
            timestamp: Date.now(),
          })
        );

        if (isAuto) {
          autoSaveStatus.value = "已自动保存";
          autoSaveType.value = "success";

          // 3秒后隐藏提示
          setTimeout(() => {
            autoSaveStatus.value = "";
          }, 3000);
        } else {
          ElMessage.success("草稿保存成功");
        }
      } catch (error) {
        console.error("保存草稿失败", error);
        if (!isAuto) {
          ElMessage.error("保存草稿失败");
        } else {
          autoSaveStatus.value = "自动保存失败";
          autoSaveType.value = "error";
          setTimeout(() => {
            autoSaveStatus.value = "";
          }, 3000);
        }
      } finally {
        draftSaving.value = false;
      }
    };

    // 重置表单
    const resetForm = async () => {
      try {
        await ElMessageBox.confirm(
          "确定要重置表单吗？这将清空所有已填写的内容。",
          "确认重置",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        if (applicationForm.value) {
          applicationForm.value.resetFields();
        }

        // 重置数据
        Object.assign(form, {
          name: "",
          gender: "",
          idNumber: "",
          birthDate: "",
          ethnicity: "",
          graduationSchool: "",
          homeAddress: "",
          guardianName: "",
          guardianRelation: "",
          guardianContact: "",
        });

        // 清空错误信息和状态
        formErrors.value = {};

        // 清除本地存储
        localStorage.removeItem("application_draft");

        ElMessage.success("表单已重置");

        if (isMobile.value) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch {
        // 用户取消重置
      }
    };

    // 加载草稿
    const loadDraft = () => {
      try {
        const draft = localStorage.getItem("application_draft");
        if (draft) {
          const draftData = JSON.parse(draft);
          const timeDiff = Date.now() - draftData.timestamp;

          // 如果草稿超过7天，删除它
          if (timeDiff > 7 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem("application_draft");
            return;
          }

          // 询问用户是否恢复草稿
          ElMessageBox.confirm(
            `发现本地保存的草稿（${new Date(
              draftData.timestamp
            ).toLocaleString()}），是否恢复？`,
            "恢复草稿",
            {
              confirmButtonText: "恢复",
              cancelButtonText: "忽略",
              type: "info",
            }
          )
            .then(() => {
              Object.assign(form, draftData.form);
              ElMessage.success("草稿已恢复");
            })
            .catch(() => {
              localStorage.removeItem("application_draft");
            });
        }
      } catch (error) {
        console.error("加载草稿失败", error);
        localStorage.removeItem("application_draft");
      }
    };

    // 生命周期
    onMounted(() => {
      window.addEventListener("resize", handleResize);
      loadDraft();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
    });

    return {
      // 数据
      form,
      rules,

      // 状态
      loading,
      draftSaving,
      applicationForm,
      formErrors,
      autoSaveStatus,
      autoSaveType,
      formProgress,

      // 响应式
      isMobile,
      formLabelPosition,

      // 方法
      submitForm,
      resetForm,
      saveDraft,
      disabledDate,
      onFormValidate,
    };
  },
});
</script>

<style scoped>
.application-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 15px 50px;
}

.application-header {
  text-align: center;
  margin-bottom: 20px;
}

.application-header h1 {
  font-size: 24px;
  color: #409eff;
  margin-bottom: 15px;
}

.progress-container {
  margin-bottom: 15px;
}

.form-progress {
  margin-bottom: 8px;
}

.progress-text {
  font-size: 14px;
  color: #606266;
}

.auto-save-alert {
  margin-bottom: 20px;
}

.required-hint {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
  gap: 4px;
}

.application-card {
  margin-bottom: 25px;
  overflow-x: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 18px;
  margin: 0;
}

.input-tip {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
  text-align: left;
}

h3 {
  margin-top: 25px;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-button .el-form-item__content {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .application-container {
    padding: 0 10px 30px;
  }

  .application-header h1 {
    font-size: 20px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .card-header h2 {
    font-size: 16px;
  }

  h3 {
    font-size: 15px;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  .el-form-item {
    margin-bottom: 18px;
  }

  .el-form-item__label {
    text-align: left !important;
    float: none !important;
    display: block !important;
    padding: 0 0 8px !important;
    line-height: 1.5 !important;
  }

  :deep(.submit-button .el-form-item__content) {
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .submit-button .el-button {
    width: 100%;
  }
}

/* 错误状态样式 */
.el-form-item.is-error .el-input__wrapper,
.el-form-item.is-error .el-select__wrapper,
.el-form-item.is-error .el-textarea__inner {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

.error-message {
  color: var(--el-color-danger);
  font-size: 12px;
  margin-top: 4px;
}
</style>

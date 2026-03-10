<template>
  <div class="h5-apply-container">
    <div class="header">
      <h1>学生信息填报</h1>
      <p class="subtitle">请如实填写以下信息</p>
    </div>

    <div v-if="!submitted" class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
        class="apply-form"
      >
        <div class="section">
          <h3>基本信息</h3>
          <el-form-item label="学生姓名" prop="studentName">
            <el-input v-model="formData.studentName" placeholder="请输入学生姓名" />
          </el-form-item>

          <el-form-item label="学生性别" prop="gender">
            <el-radio-group v-model="formData.gender">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="毕业学校" prop="graduationSchool">
            <el-input v-model="formData.graduationSchool" placeholder="请输入毕业学校" />
          </el-form-item>

          <el-form-item label="联系电话" prop="contactPhone">
            <el-input
              v-model="formData.contactPhone"
              placeholder="请输入11位手机号"
              maxlength="11"
            />
          </el-form-item>
        </div>

        <div class="section">
          <h3>学生荣誉（4-6年级，最多3项）</h3>
          <div
            v-for="(honor, index) in formData.honors"
            :key="index"
            class="honor-item"
          >
            <div class="honor-header">
              <span>荣誉 {{ index + 1 }}</span>
              <el-button
                v-if="formData.honors.length > 1"
                type="danger"
                text
                @click="removeHonor(index)"
              >
                删除
              </el-button>
            </div>

            <el-form-item
              :prop="`honors.${index}.name`"
              :rules="rules.honorName"
              label="荣誉名称"
            >
              <el-input v-model="honor.name" placeholder="请输入荣誉名称" />
            </el-form-item>

            <el-form-item
              :prop="`honors.${index}.grade`"
              :rules="rules.honorGrade"
              label="获奖年级"
            >
              <el-select v-model="honor.grade" placeholder="请选择年级">
                <el-option label="4年级" value="4年级" />
                <el-option label="5年级" value="5年级" />
                <el-option label="6年级" value="6年级" />
              </el-select>
            </el-form-item>

            <el-form-item
              :prop="`honors.${index}.imageUrl`"
              :rules="rules.honorImage"
              label="证明材料照片"
            >
              <div class="upload-container">
                <div v-if="honor.imageUrl" class="image-preview">
                  <img :src="getImageUrl(honor.imageUrl)" alt="证明材料" />
                  <div class="image-actions">
                    <el-button type="danger" size="small" @click="removeHonorImage(index)">
                      删除
                    </el-button>
                  </div>
                </div>
                <el-button v-else type="primary" @click="selectHonorImage(index)">
                  上传照片
                </el-button>
                <input
                  :ref="el => (honorFileInputs[index] = el)"
                  type="file"
                  accept="image/jpeg,image/png"
                  style="display: none"
                  @change="handleHonorImageChange($event, index)"
                />
              </div>
            </el-form-item>
          </div>

          <el-button
            v-if="formData.honors.length < 3"
            type="primary"
            plain
            @click="addHonor"
            class="add-honor-btn"
          >
            + 添加荣誉
          </el-button>
        </div>

        <div class="section">
          <h3>成绩证明（选填）</h3>
          <el-form-item label="绿色评价手册/成绩证明材料">
            <div class="certificates-container">
              <div
                v-for="(img, index) in formData.certificateImages"
                :key="index"
                class="certificate-preview"
              >
                <img :src="getImageUrl(img)" alt="证明材料" />
                <div class="image-actions">
                  <el-button type="danger" size="small" @click="removeCertificate(index)">
                    删除
                  </el-button>
                </div>
              </div>
              <el-button
                v-if="formData.certificateImages.length < 5"
                type="primary"
                plain
                @click="selectCertificate"
              >
                上传照片
              </el-button>
              <input
                ref="certificateFileInput"
                type="file"
                accept="image/jpeg,image/png"
                style="display: none"
                @change="handleCertificateChange"
              />
            </div>
          </el-form-item>
        </div>

        <div class="submit-section">
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="handleSubmit"
            class="submit-btn"
          >
            提交
          </el-button>
        </div>
      </el-form>
    </div>

    <div v-else class="success-container">
      <el-result icon="success" title="提交成功" sub-title="感谢您的填报，我们会尽快审核">
        <template #extra>
          <el-button type="primary" @click="resetForm">再次填报</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { validateToken } from '@/api/qrcode';
import { uploadFile, submitApplication, type HonorItem } from '@/api/h5-application';

export default defineComponent({
  name: 'H5ApplyView',
  setup() {
    const route = useRoute();
    const formRef = ref<FormInstance>();
    const submitting = ref(false);
    const submitted = ref(false);
    const token = ref('');
    const honorFileInputs = ref<(HTMLInputElement | null)[]>([]);
    const certificateFileInput = ref<HTMLInputElement | null>(null);

    const formData = reactive({
      studentName: '',
      gender: '',
      graduationSchool: '',
      contactPhone: '',
      honors: [
        { name: '', grade: '', imageUrl: '' },
      ] as HonorItem[],
      certificateImages: [] as string[],
    });

    const validatePhone = (rule: any, value: any, callback: any) => {
      if (!value) {
        callback(new Error('请输入联系电话'));
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'));
      } else {
        callback();
      }
    };

    const rules = {
      studentName: [
        { required: true, message: '请输入学生姓名', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
      ],
      gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
      graduationSchool: [
        { required: true, message: '请输入毕业学校', trigger: 'blur' },
        { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
      ],
      contactPhone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
      honorName: [{ required: true, message: '请输入荣誉名称', trigger: 'blur' }],
      honorGrade: [{ required: true, message: '请选择获奖年级', trigger: 'change' }],
      honorImage: [{ required: true, message: '请上传证明材料照片', trigger: 'change' }],
    };

    const addHonor = () => {
      if (formData.honors.length < 3) {
        formData.honors.push({ name: '', grade: '', imageUrl: '' });
      }
    };

    const removeHonor = (index: number) => {
      formData.honors.splice(index, 1);
    };

    const selectHonorImage = (index: number) => {
      honorFileInputs.value[index]?.click();
    };

    const handleHonorImageChange = async (event: Event, index: number) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      // 验证文件大小
      if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过5MB');
        return;
      }

      // 验证文件类型
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        ElMessage.error('只支持JPG和PNG格式');
        return;
      }

      try {
        const url = await uploadFile(file);
        formData.honors[index].imageUrl = url;
        ElMessage.success('上传成功');
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '上传失败');
      }

      // 清空input
      target.value = '';
    };

    const removeHonorImage = (index: number) => {
      formData.honors[index].imageUrl = '';
    };

    const selectCertificate = () => {
      certificateFileInput.value?.click();
    };

    const handleCertificateChange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      // 验证文件大小
      if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过5MB');
        return;
      }

      // 验证文件类型
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        ElMessage.error('只支持JPG和PNG格式');
        return;
      }

      try {
        const url = await uploadFile(file);
        formData.certificateImages.push(url);
        ElMessage.success('上传成功');
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '上传失败');
      }

      // 清空input
      target.value = '';
    };

    const removeCertificate = (index: number) => {
      formData.certificateImages.splice(index, 1);
    };

    const handleSubmit = async () => {
      if (!formRef.value) return;

      try {
        await formRef.value.validate();

        // 二次确认
        await ElMessageBox.confirm('请确认信息无误后提交', '提示', {
          confirmButtonText: '确定提交',
          cancelButtonText: '再检查一下',
          type: 'warning',
        });

        submitting.value = true;

        await submitApplication({
          token: token.value,
          studentName: formData.studentName,
          gender: formData.gender,
          graduationSchool: formData.graduationSchool,
          contactPhone: formData.contactPhone,
          honors: formData.honors,
          certificateImages: formData.certificateImages,
        });

        submitted.value = true;
        ElMessage.success('提交成功');
      } catch (error: any) {
        if (error !== 'cancel') {
          ElMessage.error(error.response?.data?.message || '提交失败');
        }
      } finally {
        submitting.value = false;
      }
    };

    const resetForm = () => {
      submitted.value = false;
      formData.studentName = '';
      formData.gender = '';
      formData.graduationSchool = '';
      formData.contactPhone = '';
      formData.honors = [{ name: '', grade: '', imageUrl: '' }];
      formData.certificateImages = [];
      formRef.value?.resetFields();
    };

    const getImageUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3031/recruitment-api/').replace(/\/$/, '');
      return `${API_BASE_URL}${url}`;
    };

    onMounted(async () => {
      token.value = route.query.token as string;
      if (!token.value) {
        ElMessage.error('二维码无效');
        return;
      }

      try {
        await validateToken(token.value);
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '二维码已失效');
      }
    });

    return {
      formRef,
      formData,
      rules,
      submitting,
      submitted,
      honorFileInputs,
      certificateFileInput,
      addHonor,
      removeHonor,
      selectHonorImage,
      handleHonorImageChange,
      removeHonorImage,
      selectCertificate,
      handleCertificateChange,
      removeCertificate,
      handleSubmit,
      resetForm,
      getImageUrl,
    };
  },
});
</script>

<style scoped>
.h5-apply-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 28px;
  margin: 0 0 10px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.form-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section {
  margin-bottom: 30px;
}

.section h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.honor-item {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.honor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
  color: #606266;
}

.upload-container {
  width: 100%;
}

.image-preview,
.certificate-preview {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin-bottom: 10px;
}

.image-preview img,
.certificate-preview img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.image-actions {
  margin-top: 10px;
}

.certificates-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.certificate-preview {
  width: 150px;
}

.add-honor-btn {
  width: 100%;
}

.submit-section {
  margin-top: 30px;
}

.submit-btn {
  width: 100%;
  height: 50px;
  font-size: 18px;
}

.success-container {
  background: white;
  border-radius: 12px;
  padding: 40px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__inner),
:deep(.el-select) {
  width: 100%;
}
</style>

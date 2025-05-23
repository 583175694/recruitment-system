<template>
  <div class="application-container">
    <div class="application-header">
      <h1>学生招生报名表</h1>
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

        <el-form-item label="照片" prop="photo" required>
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="uploadPhoto"
            :show-file-list="false"
            :before-upload="beforePhotoUpload"
            :on-progress="onPhotoProgress"
            :disabled="photoUploading"
          >
            <div v-if="photoUploading" class="upload-loading">
              <el-progress type="circle" :percentage="photoProgress" :width="120" />
              <div class="upload-text">上传中...</div>
            </div>
            <img v-else-if="form.photo" :src="getPhotoUrl()" class="avatar" />
            <div v-else class="upload-placeholder">
              <el-icon class="avatar-uploader-icon">
                <Plus />
              </el-icon>
              <div class="upload-text">点击上传照片</div>
            </div>
          </el-upload>
          <div class="upload-tip">请上传近期免冠照片，大小不超过5MB，支持JPG、PNG格式</div>
          <ErrorMessage :errors="formErrors" field="photo" />
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

        <el-form-item label="学校所属区域" prop="schoolDistrict" required>
          <el-select
            v-model="form.schoolDistrict"
            placeholder="请选择学校所属区域"
            style="width: 100%"
            clearable
            filterable
          >
            <el-option label="海淀区" value="海淀区" />
            <el-option label="朝阳区" value="朝阳区" />
            <el-option label="东城区" value="东城区" />
            <el-option label="西城区" value="西城区" />
            <el-option label="丰台区" value="丰台区" />
            <el-option label="石景山区" value="石景山区" />
            <el-option label="通州区" value="通州区" />
            <el-option label="大兴区" value="大兴区" />
            <el-option label="昌平区" value="昌平区" />
            <el-option label="房山区" value="房山区" />
            <el-option label="门头沟区" value="门头沟区" />
            <el-option label="顺义区" value="顺义区" />
            <el-option label="怀柔区" value="怀柔区" />
            <el-option label="平谷区" value="平谷区" />
            <el-option label="密云区" value="密云区" />
            <el-option label="延庆区" value="延庆区" />
            <el-option label="其他区域" value="其他区域" />
          </el-select>
          <ErrorMessage :errors="formErrors" field="schoolDistrict" />
        </el-form-item>

        <!-- 考试成绩 -->
        <h3>
          历年考试成绩
          <el-tooltip content="请填写四、五、六年级的主要科目成绩" placement="right">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </h3>
        <div v-for="(grade, gradeIndex) in form.examScores" :key="gradeIndex" class="score-item">
          <el-divider>{{ grade.gradeLevel }}</el-divider>
          
          <div v-for="(subject, subjectIndex) in grade.subjects" :key="`${gradeIndex}-${subjectIndex}`" class="subject-item">
            <h4>{{ subject.name }}</h4>
            
            <el-form-item 
              label="成绩类型" 
              :prop="`examScores.${gradeIndex}.subjects.${subjectIndex}.scoreType`"
              :rules="examScoreTypeRules"
            >
              <el-radio-group v-model="subject.scoreType">
                <el-radio :value="'numeric'">分数</el-radio>
                <el-radio :value="'grade'">等级</el-radio>
              </el-radio-group>
              <ErrorMessage :errors="formErrors" :field="`examScores.${gradeIndex}.subjects.${subjectIndex}.scoreType`" />
            </el-form-item>
            
            <el-form-item 
              v-if="subject.scoreType === 'numeric'" 
              label="分数" 
              :prop="`examScores.${gradeIndex}.subjects.${subjectIndex}.score`"
              :rules="scoreRules"
            >
              <el-input 
                v-model="subject.score" 
                placeholder="请输入分数"
                type="number"
                :min="0"
                :max="100"
                clearable
              />
              <div class="input-tip">请输入0-100之间的分数</div>
              <ErrorMessage :errors="formErrors" :field="`examScores.${gradeIndex}.subjects.${subjectIndex}.score`" />
            </el-form-item>
            
            <el-form-item 
              v-if="subject.scoreType === 'grade'" 
              label="等级" 
              :prop="`examScores.${gradeIndex}.subjects.${subjectIndex}.grade`"
              :rules="gradeRules"
            >
              <el-select v-model="subject.grade" placeholder="请选择等级" style="width: 100%" clearable>
                <el-option label="A（优秀）" value="A" />
                <el-option label="B（良好）" value="B" />
                <el-option label="C（合格）" value="C" />
                <el-option label="D（不合格）" value="D" />
              </el-select>
              <ErrorMessage :errors="formErrors" :field="`examScores.${gradeIndex}.subjects.${subjectIndex}.grade`" />
            </el-form-item>
          </div>
          
          <el-form-item 
            label="成绩证明" 
            :prop="`examScores.${gradeIndex}.certificateImage`"
            :rules="certificateRules"
          >
            <el-upload
              class="certificate-uploader"
              action="#"
              :http-request="(data) => uploadCertificate(data, 'examScores', gradeIndex)"
              :show-file-list="false"
              :before-upload="beforeCertificateUpload"
              :on-progress="(event) => onCertificateProgress(event, 'examScores', gradeIndex)"
              :disabled="certificateUploading[`examScores-${gradeIndex}`]"
            >
              <div v-if="certificateUploading[`examScores-${gradeIndex}`]" class="upload-loading">
                <el-progress type="circle" :percentage="certificateProgress[`examScores-${gradeIndex}`] || 0" :width="80" />
                <div class="upload-text">上传中...</div>
              </div>
              <img v-else-if="grade.certificateImage" :src="getCertificateUrl(grade.certificateImage)" class="certificate">
              <el-button v-else type="primary" :icon="Upload">上传成绩证明</el-button>
            </el-upload>
            <div class="upload-tip">支持图片或PDF格式，不超过10MB</div>
            <ErrorMessage :errors="formErrors" :field="`examScores.${gradeIndex}.certificateImage`" />
          </el-form-item>
        </div>

        <!-- 荣誉成就 -->
        <h3>
          荣誉成就
          <el-tooltip content="可选项目，如有相关荣誉请填写" placement="right">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
          <span class="optional-label">（可选）</span>
        </h3>
        <div
          v-for="(achievement, index) in form.achievements"
          :key="index"
          class="achievement-item"
        >
          <el-divider>荣誉 {{ index + 1 }}</el-divider>

          <el-form-item
            label="荣誉名称"
            :prop="'achievements.' + index + '.name'"
            :rules="achievementNameRules"
          >
            <el-input
              v-model="achievement.name"
              placeholder="请输入荣誉名称"
              maxlength="100"
              show-word-limit
              clearable
            />
            <ErrorMessage :errors="formErrors" :field="`achievements.${index}.name`" />
          </el-form-item>

          <el-form-item
            label="荣誉级别"
            :prop="'achievements.' + index + '.level'"
            :rules="achievementLevelRules"
          >
            <el-select
              v-model="achievement.level"
              placeholder="请选择荣誉级别"
              style="width: 100%"
              clearable
            >
              <el-option label="校级" value="校级" />
              <el-option label="区级" value="区级" />
              <el-option label="市级" value="市级" />
              <el-option label="省级" value="省级" />
              <el-option label="国家级" value="国家级" />
              <el-option label="国际级" value="国际级" />
            </el-select>
            <ErrorMessage :errors="formErrors" :field="`achievements.${index}.level`" />
          </el-form-item>

          <el-form-item
            label="获奖日期"
            :prop="'achievements.' + index + '.awardDate'"
            :rules="achievementDateRules"
          >
            <el-date-picker
              v-model="achievement.awardDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :disabled-date="disabledDate"
              clearable
            />
            <ErrorMessage :errors="formErrors" :field="`achievements.${index}.awardDate`" />
          </el-form-item>

          <el-form-item
            label="证书照片"
            :prop="'achievements.' + index + '.certificateImage'"
          >
            <el-upload
              class="certificate-uploader"
              action="#"
              :http-request="(data) => uploadCertificate(data, 'achievements', index)"
              :show-file-list="false"
              :before-upload="beforeCertificateUpload"
              :on-progress="(event) => onCertificateProgress(event, 'achievements', index)"
              :disabled="certificateUploading[`achievements-${index}`]"
            >
              <div v-if="certificateUploading[`achievements-${index}`]" class="upload-loading">
                <el-progress type="circle" :percentage="certificateProgress[`achievements-${index}`] || 0" :width="80" />
                <div class="upload-text">上传中...</div>
              </div>
              <img
                v-else-if="achievement.certificateImage"
                :src="getCertificateUrl(achievement.certificateImage)"
                class="certificate"
              />
              <el-button v-else type="primary" :icon="Upload">上传证书照片</el-button>
            </el-upload>
            <div class="upload-tip">可选项目，支持图片或PDF格式，不超过10MB</div>
            <ErrorMessage :errors="formErrors" :field="`achievements.${index}.certificateImage`" />
          </el-form-item>

          <el-form-item
            label="描述"
            :prop="'achievements.' + index + '.description'"
          >
            <el-input
              type="textarea"
              v-model="achievement.description"
              placeholder="请简要描述该荣誉"
              :rows="3"
              maxlength="200"
              show-word-limit
            />
            <ErrorMessage :errors="formErrors" :field="`achievements.${index}.description`" />
          </el-form-item>

          <el-button
            type="danger"
            @click="removeAchievement(index)"
            v-if="form.achievements.length > 1"
            style="width: 100%"
            :icon="Delete"
          >
            删除此荣誉
          </el-button>
        </div>

        <el-button
          type="primary"
          @click="addAchievement"
          style="width: 100%; margin-bottom: 20px"
          :icon="Plus"
          :disabled="form.achievements.length >= 10"
        >
          添加荣誉 ({{ form.achievements.length }}/10)
        </el-button>

        <!-- 家长信息 -->
        <h3>家长信息</h3>
        <el-form-item label="家长姓名" prop="parentName" required>
          <el-input 
            v-model="form.parentName" 
            placeholder="请输入家长姓名"
            maxlength="20"
            show-word-limit
            clearable
          />
          <ErrorMessage :errors="formErrors" field="parentName" />
        </el-form-item>

        <el-form-item label="工作单位" prop="parentWorkplace" required>
          <el-input
            v-model="form.parentWorkplace"
            placeholder="请输入工作单位"
            maxlength="100"
            show-word-limit
            clearable
          />
          <ErrorMessage :errors="formErrors" field="parentWorkplace" />
        </el-form-item>

        <el-form-item label="联系电话" prop="parentContact" required>
          <el-input
            v-model="form.parentContact"
            placeholder="请输入联系电话"
            maxlength="11"
            clearable
          />
          <div class="input-tip">请输入11位手机号码</div>
          <ErrorMessage :errors="formErrors" field="parentContact" />
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
            {{ loading ? '提交中...' : '提交报名表' }}
          </el-button>
          <el-button 
            @click="resetForm" 
            size="large"
            :icon="RefreshLeft"
          >
            重置表单
          </el-button>
          <el-button 
            @click="saveDraft" 
            :loading="draftSaving"
            size="large"
            :icon="FolderOpened"
          >
            {{ draftSaving ? '保存中...' : '保存草稿' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 简历上传区域 -->
    <el-card class="resume-card">
      <template #header>
        <div class="card-header">
          <h2>简历上传（可选）</h2>
        </div>
      </template>

      <p class="upload-tip">
        如果您已有个人简历，可以直接上传简历文件，系统将自动提取信息填写表单
      </p>

      <el-upload
        class="resume-uploader"
        action="#"
        accept=".pdf,.doc,.docx"
        :http-request="uploadResume"
        :show-file-list="false"
        :before-upload="beforeResumeUpload"
        :on-progress="onResumeProgress"
        :disabled="resumeUploading"
      >
        <div v-if="resumeUploading" class="upload-loading">
          <el-progress type="circle" :percentage="resumeProgress" :width="60" />
          <div class="upload-text">上传中...</div>
        </div>
        <el-button v-else type="primary" :icon="Document">
          上传简历
        </el-button>
        <span class="resume-tip">
          支持PDF、DOC、DOCX格式，不超过20MB
        </span>
      </el-upload>

      <div v-if="resumeId" class="resume-status">
        <el-alert
          v-if="resumeStatus === 'pending'"
          title="简历等待处理..."
          type="info"
          show-icon
        />
        <el-alert
          v-if="resumeStatus === 'processing'"
          title="正在分析简历..."
          type="warning"
          show-icon
        />
        <el-alert
          v-if="resumeStatus === 'completed'"
          title="简历分析完成！数据已自动填充到表单"
          type="success"
          show-icon
        />
        <el-alert
          v-if="resumeStatus === 'failed'"
          :title="resumeError || '简历分析失败，请手动填写表单'"
          type="error"
          show-icon
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createApplication,
  uploadPhoto as uploadPhotoApi,
  uploadCertificate as uploadCertificateApi,
  uploadResume as uploadResumeApi,
  getResumeStatus as getResumeStatusApi,
} from "@/api/application";
import { debounce } from '@/utils/debounce';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { 
  Plus, 
  Document, 
  Upload, 
  Delete, 
  RefreshLeft, 
  FolderOpened,
  InfoFilled,
  QuestionFilled
} from '@element-plus/icons-vue';

// 类型定义
interface FormData {
  name: string;
  gender: string;
  idNumber: string;
  photo: string;
  graduationSchool: string;
  schoolDistrict: string;
  examScores: Array<{
    gradeLevel: string;
    subjects: Array<{
      name: string;
      scoreType: 'numeric' | 'grade';
      score: string;
      grade: string;
    }>;
    certificateImage: string;
  }>;
  achievements: Array<{
    name: string;
    level: string;
    certificateImage: string;
    awardDate: string;
    description: string;
  }>;
  parentName: string;
  parentWorkplace: string;
  parentContact: string;
}

export default defineComponent({
  name: "ApplicationView",
  components: {
    ErrorMessage,
    Plus,
    Document,
    Upload,
    Delete,
    RefreshLeft,
    FolderOpened,
    InfoFilled,
    QuestionFilled
  },
  setup() {
    const form = reactive<FormData>({
      name: "",
      gender: "",
      idNumber: "",
      photo: "",
      graduationSchool: "",
      schoolDistrict: "",
      examScores: [
        {
          gradeLevel: "四年级",
          subjects: [
            { name: "语文", scoreType: "numeric", score: "", grade: "" },
            { name: "数学", scoreType: "numeric", score: "", grade: "" },
            { name: "英语", scoreType: "numeric", score: "", grade: "" }
          ],
          certificateImage: ""
        },
        {
          gradeLevel: "五年级",
          subjects: [
            { name: "语文", scoreType: "numeric", score: "", grade: "" },
            { name: "数学", scoreType: "numeric", score: "", grade: "" },
            { name: "英语", scoreType: "numeric", score: "", grade: "" }
          ],
          certificateImage: ""
        },
        {
          gradeLevel: "六年级",
          subjects: [
            { name: "语文", scoreType: "numeric", score: "", grade: "" },
            { name: "数学", scoreType: "numeric", score: "", grade: "" },
            { name: "英语", scoreType: "numeric", score: "", grade: "" }
          ],
          certificateImage: ""
        }
      ],
      achievements: [
        {
          name: "",
          level: "",
          certificateImage: "",
          awardDate: "",
          description: "",
        },
      ],
      parentName: "",
      parentWorkplace: "",
      parentContact: "",
    });

    // 状态管理
    const resumeId = ref<number | null>(null);
    const resumeStatus = ref("");
    const resumeError = ref("");
    const loading = ref(false);
    const draftSaving = ref(false);
    const applicationForm = ref<any>(null);
    const formErrors = ref<Record<string, string[]>>({});
    const autoSaveStatus = ref("");
    const autoSaveType = ref<"success" | "warning" | "error">("success");
    
    // 上传进度状态
    const photoUploading = ref(false);
    const photoProgress = ref(0);
    const resumeUploading = ref(false);
    const resumeProgress = ref(0);
    const certificateUploading = ref<Record<string, boolean>>({});
    const certificateProgress = ref<Record<string, number>>({});

    // 响应式处理
    const windowWidth = ref(window.innerWidth);
    const isMobile = computed(() => windowWidth.value < 768);
    const formLabelPosition = computed(() => isMobile.value ? "top" : "right");

    // 表单进度计算
    const formProgress = computed(() => {
      let totalFields = 0;
      let filledFields = 0;

      // 基本信息
      const basicFields = ['name', 'gender', 'idNumber', 'photo', 'graduationSchool', 'schoolDistrict'];
      totalFields += basicFields.length;
      filledFields += basicFields.filter(field => form[field as keyof FormData]).length;

      // 考试成绩
      form.examScores.forEach(grade => {
        grade.subjects.forEach(subject => {
          totalFields += 2; // scoreType + (score or grade)
          if (subject.scoreType) filledFields++;
          if (subject.scoreType === 'numeric' && subject.score) filledFields++;
          if (subject.scoreType === 'grade' && subject.grade) filledFields++;
        });
        totalFields += 1; // certificateImage
        if (grade.certificateImage) filledFields++;
      });

      // 家长信息
      const parentFields = ['parentName', 'parentWorkplace', 'parentContact'];
      totalFields += parentFields.length;
      filledFields += parentFields.filter(field => form[field as keyof FormData]).length;

      // 荣誉成就（可选）
      const validAchievements = form.achievements.filter(ach => ach.name && ach.level && ach.awardDate);
      filledFields += validAchievements.length * 3; // name, level, awardDate

      return Math.round((filledFields / totalFields) * 100);
    });

    // 完整的表单验证规则
    const rules = {
      name: [
        { required: true, message: "请输入学生姓名", trigger: "blur" },
        { min: 2, max: 20, message: "姓名长度应为2-20个字符", trigger: "blur" }
      ],
      gender: [
        { required: true, message: "请选择性别", trigger: "change" }
      ],
      idNumber: [
        { required: true, message: "请输入身份证号", trigger: "blur" },
        {
          pattern: /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]$/,
          message: "身份证号格式不正确",
          trigger: "blur",
        },
      ],
      photo: [
        { required: true, message: "请上传照片", trigger: "change" }
      ],
      graduationSchool: [
        { required: true, message: "请输入毕业学校", trigger: "blur" },
        { max: 50, message: "学校名称不能超过50个字符", trigger: "blur" }
      ],
      schoolDistrict: [
        { required: true, message: "请选择学校所属区域", trigger: "change" }
      ],
      parentName: [
        { required: true, message: "请输入家长姓名", trigger: "blur" },
        { min: 2, max: 20, message: "姓名长度应为2-20个字符", trigger: "blur" }
      ],
      parentWorkplace: [
        { required: true, message: "请输入家长工作单位", trigger: "blur" },
        { max: 100, message: "工作单位名称不能超过100个字符", trigger: "blur" }
      ],
      parentContact: [
        { required: true, message: "请输入家长联系电话", trigger: "blur" },
        {
          pattern: /^1[3-9]\d{9}$/,
          message: "手机号格式不正确",
          trigger: "blur",
        },
      ],
    };

    // 考试成绩验证规则
    const examScoreTypeRules = [
      { required: true, message: "请选择成绩类型", trigger: "change" }
    ];

    const scoreRules = [
      { required: true, message: "请输入分数", trigger: "blur" },
      {
        validator: (rule: any, value: any, callback: any) => {
          if (value === '' || value === null || value === undefined) {
            callback(new Error('请输入分数'));
            return;
          }
          const score = Number(value);
          if (isNaN(score) || score < 0 || score > 100) {
            callback(new Error('分数应为0-100之间的数字'));
            return;
          }
          callback();
        },
        trigger: "blur"
      }
    ];

    const gradeRules = [
      { required: true, message: "请选择等级", trigger: "change" }
    ];

    const certificateRules = [
      { required: true, message: "请上传成绩证明", trigger: "change" }
    ];

    // 荣誉成就验证规则
    const achievementNameRules = [
      {
        validator: (rule: any, value: any, callback: any) => {
          const index = rule.fullField.match(/achievements\.(\d+)\.name/)?.[1];
          if (index !== undefined) {
            const achievement = form.achievements[parseInt(index)];
            const hasAnyField = achievement.name || achievement.level || achievement.awardDate || achievement.certificateImage || achievement.description;
            
            if (hasAnyField && !value) {
              callback(new Error('请输入荣誉名称'));
              return;
            }
          }
          callback();
        },
        trigger: "blur"
      }
    ];

    const achievementLevelRules = [
      {
        validator: (rule: any, value: any, callback: any) => {
          const index = rule.fullField.match(/achievements\.(\d+)\.level/)?.[1];
          if (index !== undefined) {
            const achievement = form.achievements[parseInt(index)];
            if (achievement.name && !value) {
              callback(new Error('请选择荣誉级别'));
              return;
            }
          }
          callback();
        },
        trigger: "change"
      }
    ];

    const achievementDateRules = [
      {
        validator: (rule: any, value: any, callback: any) => {
          const index = rule.fullField.match(/achievements\.(\d+)\.awardDate/)?.[1];
          if (index !== undefined) {
            const achievement = form.achievements[parseInt(index)];
            if (achievement.name && !value) {
              callback(new Error('请选择获奖日期'));
              return;
            }
          }
          callback();
        },
        trigger: "change"
      }
    ];

    // 日期验证：不能选择未来日期
    const disabledDate = (time: Date) => {
      return time.getTime() > Date.now();
    };

    // 自动保存功能
    const autoSave = debounce(() => {
      if (formProgress.value > 10) { // 只有在填写了一定内容后才自动保存
        saveDraft(true);
      }
    }, 3000);

    // 监听表单变化
    watch(form, () => {
      formErrors.value = {}; // 清空错误信息
      autoSave();
    }, { deep: true });

    // 响应式窗口大小
    const handleResize = debounce(() => {
      windowWidth.value = window.innerWidth;
    }, 200);

    // 表单验证监听
    const onFormValidate = (prop: string, isValid: boolean, message: string) => {
      if (isValid) {
        // 如果验证通过，清除该字段的错误信息
        if (formErrors.value[prop]) {
          delete formErrors.value[prop];
        }
      }
    };

    // 上传进度处理
    const onPhotoProgress = (event: any) => {
      photoProgress.value = Math.round((event.loaded / event.total) * 100);
    };

    const onResumeProgress = (event: any) => {
      resumeProgress.value = Math.round((event.loaded / event.total) * 100);
    };

    const onCertificateProgress = (event: any, type: string, index: number) => {
      const key = `${type}-${index}`;
      certificateProgress.value[key] = Math.round((event.loaded / event.total) * 100);
    };

    // 添加荣誉
    const addAchievement = () => {
      if (form.achievements.length >= 10) {
        ElMessage.warning('最多只能添加10个荣誉');
        return;
      }

      form.achievements.push({
        name: "",
        level: "",
        certificateImage: "",
        awardDate: "",
        description: "",
      });

      // 移动端自动滚动到新添加的荣誉
      if (isMobile.value) {
        nextTick(() => {
          const achievements = document.querySelectorAll(".achievement-item");
          if (achievements.length > 0) {
            const lastAchievement = achievements[achievements.length - 1];
            lastAchievement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        });
      }
    };

    // 移除荣誉
    const removeAchievement = async (index: number) => {
      if (form.achievements.length <= 1) {
        ElMessage.warning('至少保留一个荣誉项');
        return;
      }

      try {
        await ElMessageBox.confirm(
          '确定要删除这个荣誉吗？',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
        
        form.achievements.splice(index, 1);
        ElMessage.success('删除成功');
      } catch {
        // 用户取消删除
      }
    };

    // 文件上传前验证
    const beforePhotoUpload = (file: File) => {
      const isImage = file.type.startsWith("image/");
      const isValidFormat = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isImage || !isValidFormat) {
        ElMessage.error("上传文件只能是 JPG/PNG 格式!");
        return false;
      }

      if (!isLt5M) {
        ElMessage.error("上传图片大小不能超过 5MB!");
        return false;
      }

      return true;
    };

    const beforeCertificateUpload = (file: File) => {
      const isImageOrPdf = file.type.startsWith("image/") || file.type === "application/pdf";
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isImageOrPdf) {
        ElMessage.error("上传文件只能是图片或PDF格式!");
        return false;
      }

      if (!isLt10M) {
        ElMessage.error("上传文件大小不能超过 10MB!");
        return false;
      }

      return true;
    };

    const beforeResumeUpload = (file: File) => {
      const isPdfOrDoc = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ].includes(file.type);
      const isLt20M = file.size / 1024 / 1024 < 20;

      if (!isPdfOrDoc) {
        ElMessage.error("上传文件只能是PDF或Word格式!");
        return false;
      }

      if (!isLt20M) {
        ElMessage.error("上传文件大小不能超过 20MB!");
        return false;
      }

      return true;
    };

    // 上传照片
    const uploadPhoto = async (options: any) => {
      try {
        photoUploading.value = true;
        photoProgress.value = 0;
        
        const { data } = await uploadPhotoApi(options.file);
        form.photo = data.path;
        ElMessage.success("照片上传成功");
      } catch (error: any) {
        console.error("照片上传失败", error);
        ElMessage.error("照片上传失败: " + (error.response?.data?.message || error.message));
        
        // 重试选项
        ElMessageBox.confirm(
          '照片上传失败，是否重试？',
          '上传失败',
          {
            confirmButtonText: '重试',
            cancelButtonText: '取消',
            type: 'error',
          }
        ).then(() => {
          uploadPhoto(options);
        }).catch(() => {
          // 用户取消重试
        });
      } finally {
        photoUploading.value = false;
        photoProgress.value = 0;
      }
    };

    // 上传证书
    const uploadCertificate = async (
      options: any,
      fieldName: string,
      index: number
    ) => {
      const key = `${fieldName}-${index}`;
      try {
        certificateUploading.value[key] = true;
        certificateProgress.value[key] = 0;
        
        const { data } = await uploadCertificateApi(options.file);
        
        if (fieldName === "examScores") {
          form.examScores[index].certificateImage = data.path;
        } else if (fieldName === "achievements") {
          form.achievements[index].certificateImage = data.path;
        }
        
        ElMessage.success("证书上传成功");
      } catch (error: any) {
        console.error("证书上传失败", error);
        ElMessage.error("证书上传失败: " + (error.response?.data?.message || error.message));
        
        // 重试选项
        ElMessageBox.confirm(
          '证书上传失败，是否重试？',
          '上传失败',
          {
            confirmButtonText: '重试',
            cancelButtonText: '取消',
            type: 'error',
          }
        ).then(() => {
          uploadCertificate(options, fieldName, index);
        }).catch(() => {
          // 用户取消重试
        });
      } finally {
        certificateUploading.value[key] = false;
        certificateProgress.value[key] = 0;
      }
    };

    // 上传简历
    const uploadResume = async (options: any) => {
      try {
        resumeUploading.value = true;
        resumeProgress.value = 0;
        
        const { data } = await uploadResumeApi(options.file);
        resumeId.value = data.resumeId;
        resumeStatus.value = "pending";

        // 开始轮询简历处理状态
        pollResumeStatus();

        ElMessage.success("简历上传成功，正在分析...");
      } catch (error: any) {
        console.error("简历上传失败", error);
        ElMessage.error("简历上传失败: " + (error.response?.data?.message || error.message));
      } finally {
        resumeUploading.value = false;
        resumeProgress.value = 0;
      }
    };

    // 轮询简历状态
    const pollResumeStatus = async () => {
      if (!resumeId.value) return;

      try {
        const { data } = await getResumeStatusApi(resumeId.value);
        resumeStatus.value = data.status;

        if (data.status === "completed") {
          fillFormWithResumeData(data.data);
          ElMessage.success("简历分析完成，表单已自动填充");

          if (isMobile.value) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        } else if (data.status === "failed") {
          resumeError.value = data.error;
          ElMessage.error("简历分析失败：" + data.error);
        } else if (data.status === "processing" || data.status === "pending") {
          setTimeout(pollResumeStatus, 3000);
        }
      } catch (error: any) {
        console.error("获取简历状态失败", error);
        ElMessage.error("获取简历状态失败");
      }
    };

    // 填充简历数据
    const fillFormWithResumeData = (data: any) => {
      if (!data) return;

      // 填充基本信息
      if (data.name) form.name = data.name;
      if (data.gender) form.gender = data.gender;
      if (data.idNumber) form.idNumber = data.idNumber;
      if (data.graduationSchool) form.graduationSchool = data.graduationSchool;
      if (data.schoolDistrict) form.schoolDistrict = data.schoolDistrict;

      // 填充考试成绩
      if (data.examScores && data.examScores.length > 0) {
        data.examScores.forEach((score: any, index: number) => {
          if (index < form.examScores.length) {
            if (score.certificateImage) {
              form.examScores[index].certificateImage = score.certificateImage;
            }
            
            if (score.subjects && score.subjects.length > 0) {
              score.subjects.forEach((subject: any, subIndex: number) => {
                if (subIndex < form.examScores[index].subjects.length) {
                  if (subject.score) {
                    form.examScores[index].subjects[subIndex].score = subject.score;
                    form.examScores[index].subjects[subIndex].scoreType = 'numeric';
                  } else if (subject.grade) {
                    form.examScores[index].subjects[subIndex].grade = subject.grade;
                    form.examScores[index].subjects[subIndex].scoreType = 'grade';
                  }
                }
              });
            }
          }
        });
      }

      // 填充荣誉
      if (data.achievements && data.achievements.length > 0) {
        form.achievements = [];
        data.achievements.forEach((achievement: any) => {
          form.achievements.push({
            name: achievement.name || "",
            level: achievement.level || "",
            certificateImage: "",
            awardDate: achievement.awardDate || "",
            description: achievement.description || "",
          });
        });
      }

      // 填充家长信息
      if (data.parentName) form.parentName = data.parentName;
      if (data.parentWorkplace) form.parentWorkplace = data.parentWorkplace;
      if (data.parentContact) form.parentContact = data.parentContact;
    };

    // 获取照片URL
    const getPhotoUrl = () => {
      return import.meta.env.VITE_API_BASE_URL + form.photo;
    };

    // 获取证书URL
    const getCertificateUrl = (path: string) => {
      return import.meta.env.VITE_API_BASE_URL + path;
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
        
        // 过滤空的荣誉成就
        formToSubmit.achievements = formToSubmit.achievements.filter(
          ach => ach.name || ach.level || ach.awardDate || ach.certificateImage || ach.description
        );

        // 提交数据
        await createApplication(formToSubmit);

        ElMessage.success("报名表提交成功！");
        
        // 清除本地存储的草稿
        localStorage.removeItem('application_draft');
        
        // 可以跳转到成功页面
        // router.push('/application/success');
        
      } catch (error: any) {
        console.error("提交失败", error);
        
        if (error.response?.data?.validationErrors) {
          const errors = error.response.data.validationErrors || {};
          
          // 确保错误格式正确
          Object.keys(errors).forEach(key => {
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
          ElMessage.error(error.response?.data?.message || "提交失败，请稍后重试");
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
        localStorage.setItem('application_draft', JSON.stringify({
          form,
          timestamp: Date.now()
        }));
        
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
          '确定要重置表单吗？这将清空所有已填写的内容。',
          '确认重置',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
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
          photo: "",
          graduationSchool: "",
          schoolDistrict: "",
          examScores: [
            {
              gradeLevel: "四年级",
              subjects: [
                { name: "语文", scoreType: "numeric", score: "", grade: "" },
                { name: "数学", scoreType: "numeric", score: "", grade: "" },
                { name: "英语", scoreType: "numeric", score: "", grade: "" }
              ],
              certificateImage: ""
            },
            {
              gradeLevel: "五年级",
              subjects: [
                { name: "语文", scoreType: "numeric", score: "", grade: "" },
                { name: "数学", scoreType: "numeric", score: "", grade: "" },
                { name: "英语", scoreType: "numeric", score: "", grade: "" }
              ],
              certificateImage: ""
            },
            {
              gradeLevel: "六年级",
              subjects: [
                { name: "语文", scoreType: "numeric", score: "", grade: "" },
                { name: "数学", scoreType: "numeric", score: "", grade: "" },
                { name: "英语", scoreType: "numeric", score: "", grade: "" }
              ],
              certificateImage: ""
            }
          ],
          achievements: [
            {
              name: "",
              level: "",
              certificateImage: "",
              awardDate: "",
              description: "",
            },
          ],
          parentName: "",
          parentWorkplace: "",
          parentContact: "",
        });

        // 清空错误信息和状态
        formErrors.value = {};
        resumeId.value = null;
        resumeStatus.value = "";
        resumeError.value = "";
        
        // 清除本地存储
        localStorage.removeItem('application_draft');

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
        const draft = localStorage.getItem('application_draft');
        if (draft) {
          const draftData = JSON.parse(draft);
          const timeDiff = Date.now() - draftData.timestamp;
          
          // 如果草稿超过7天，删除它
          if (timeDiff > 7 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem('application_draft');
            return;
          }
          
          // 询问用户是否恢复草稿
          ElMessageBox.confirm(
            `发现本地保存的草稿（${new Date(draftData.timestamp).toLocaleString()}），是否恢复？`,
            '恢复草稿',
            {
              confirmButtonText: '恢复',
              cancelButtonText: '忽略',
              type: 'info',
            }
          ).then(() => {
            Object.assign(form, draftData.form);
            ElMessage.success("草稿已恢复");
          }).catch(() => {
            localStorage.removeItem('application_draft');
          });
        }
      } catch (error) {
        console.error("加载草稿失败", error);
        localStorage.removeItem('application_draft');
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
      examScoreTypeRules,
      scoreRules,
      gradeRules,
      certificateRules,
      achievementNameRules,
      achievementLevelRules,
      achievementDateRules,
      
      // 状态
      loading,
      draftSaving,
      resumeId,
      resumeStatus,
      resumeError,
      applicationForm,
      formErrors,
      autoSaveStatus,
      autoSaveType,
      formProgress,
      
      // 上传状态
      photoUploading,
      photoProgress,
      resumeUploading,
      resumeProgress,
      certificateUploading,
      certificateProgress,
      
      // 响应式
      isMobile,
      formLabelPosition,
      
      // 方法
      getPhotoUrl,
      getCertificateUrl,
      addAchievement,
      removeAchievement,
      beforePhotoUpload,
      beforeCertificateUpload,
      beforeResumeUpload,
      uploadPhoto,
      uploadCertificate,
      uploadResume,
      submitForm,
      resetForm,
      saveDraft,
      disabledDate,
      onFormValidate,
      onPhotoProgress,
      onResumeProgress,
      onCertificateProgress,
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

.application-card,
.resume-card {
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

.avatar-uploader {
  width: 150px;
  height: 150px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
  color: #8c939d;
  text-align: center;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.avatar {
  width: 150px;
  height: 150px;
  display: block;
}

.certificate {
  max-width: 100%;
  max-height: 150px;
  border-radius: 4px;
}

.certificate-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-item,
.achievement-item {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f9fafc;
}

.subject-item {
  margin: 15px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border-left: 2px solid #409eff;
}

.subject-item h4 {
  margin: 0 0 15px 0;
  font-size: 15px;
  color: #606266;
}

.upload-tip,
.input-tip {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
  text-align: center;
}

.input-tip {
  text-align: left;
}

.resume-status {
  margin-top: 20px;
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

.help-icon {
  color: #909399;
  cursor: help;
}

.optional-label {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.submit-button .el-form-item__content {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.resume-uploader {
  text-align: center;
}

.resume-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
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

  .submit-button .el-form-item__content {
    flex-direction: column;
    gap: 10px;
  }

  .submit-button .el-button {
    width: 100%;
  }

  .subject-item {
    padding: 10px;
    margin: 10px 0;
  }
  
  .subject-item h4 {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .avatar-uploader {
    width: 120px;
    height: 120px;
  }

  .avatar {
    width: 120px;
    height: 120px;
  }

  .required-hint {
    font-size: 11px;
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

/* 加载状态 */
.upload-loading .upload-text {
  margin-top: 8px;
  color: #409eff;
}

/* 工具提示 */
.el-tooltip__trigger {
  cursor: help;
}
</style>

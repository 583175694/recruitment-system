import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3031/recruitment-api/').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // OCR 识别可能需要较长时间
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export interface UploadResumeResult {
  jobId: string;
  message: string;
}

export interface JobStatusResult {
  status: 'processing' | 'completed';
  message?: string;
  data?: any;
}

export const uploadResume = async (files: File[]): Promise<UploadResumeResult> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  const response = await api.post('/teacher-upload/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const getJobStatus = async (jobId: string): Promise<JobStatusResult> => {
  const response = await api.get(`/teacher-upload/status/${jobId}`);
  return response.data.data;
};

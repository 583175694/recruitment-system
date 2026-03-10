import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3031/recruitment-api/').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface HonorItem {
  name: string;
  grade: string;
  imageUrl: string;
}

export interface H5Application {
  id: number;
  qrCodeId: number;
  studentName: string;
  gender: string;
  graduationSchool: string;
  contactPhone: string;
  idCardNumber?: string;
  honors: HonorItem[];
  certificateImages: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface CreateH5ApplicationDto {
  token: string;
  studentName: string;
  gender: string;
  graduationSchool: string;
  contactPhone: string;
  honors: HonorItem[];
  certificateImages?: string[];
}

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/h5-application/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.url;
};

export const submitApplication = async (data: CreateH5ApplicationDto): Promise<H5Application> => {
  const response = await api.post('/h5-application/submit', data);
  return response.data.data;
};

export const getApplicationList = async (params: {
  page: number;
  pageSize: number;
  school?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  list: H5Application[];
  total: number;
  page: number;
  pageSize: number;
}> => {
  const response = await api.get('/h5-application/list', { params });
  return response.data.data;
};

export const getApplicationDetail = async (id: number): Promise<H5Application> => {
  const response = await api.get(`/h5-application/detail/${id}`);
  return response.data.data;
};

export const approveApplication = async (id: number): Promise<void> => {
  await api.post(`/h5-application/approve/${id}`);
};

export const rejectApplication = async (id: number): Promise<void> => {
  await api.post(`/h5-application/reject/${id}`);
};

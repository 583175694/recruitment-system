import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3031/recruitment-api/').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

export interface QrCode {
  id: number;
  token: string;
  status: 'active' | 'expired';
  submissionCount: number;
  createdAt: string;
  expiredAt?: string;
}

export interface GenerateQrCodeResponse {
  qrCode: QrCode;
  imageDataUrl: string;
}

export const generateQrCode = async (): Promise<GenerateQrCodeResponse> => {
  const response = await api.post('/qrcode/generate');
  return response.data.data;
};

export const getActiveQrCode = async (): Promise<QrCode | null> => {
  const response = await api.get('/qrcode/active');
  return response.data.data;
};

export const getQrCodeList = async (): Promise<QrCode[]> => {
  const response = await api.get('/qrcode/list');
  return response.data.data;
};

export const validateToken = async (token: string): Promise<QrCode> => {
  const response = await api.get(`/qrcode/validate/${token}`);
  return response.data.data;
};

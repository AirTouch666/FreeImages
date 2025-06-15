// 上传响应类型
export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  signedUrl?: string;
  publicUrl?: string;
  contentType?: string;
}

// 图片类型
export interface Image {
  id: string;
  url: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 
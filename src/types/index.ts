// 配置类型
export interface Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  uploadPath: string;
  publicDomain: string; // 公共访问域名
}

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
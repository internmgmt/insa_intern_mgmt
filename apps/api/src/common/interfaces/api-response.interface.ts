export interface ApiError {
  code?: string;
  message?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string | null;
  data?: T | null;
  error?: ApiError | null;
}

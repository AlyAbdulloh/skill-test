export interface ApiResponse<T = unknown> {
  code: string
  success: boolean
  message: string
  data: T
}

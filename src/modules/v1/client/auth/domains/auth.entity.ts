export interface LoginPayload {
  username: string
  password: string
}

export interface LastLoggedAccount {
  username: string
  name: string
  lastLogin: number
}

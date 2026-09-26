export interface User {
  id: number
  email: string
  name: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface SignupPayload {
  email: string
  name: string
  password: string
  confirm_password: string
}
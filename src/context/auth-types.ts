export interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (form: LoginForm) => void
  logout: () => void
  checkToken: () => void
}

export interface User {
  id: string
  email: string
  role: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginForm {
  email: string
  password: string
}
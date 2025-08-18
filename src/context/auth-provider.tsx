import { useState, type ReactNode } from "react"
import { AuthContext } from "./auth-context"
import api from "@/lib/api"
import type { AuthResponse, LoginForm, User } from "./auth-types"

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Login del usuario
  const login = async (form: LoginForm): Promise<void> => {
    const response = await api.post<AuthResponse>("/auth/login", form)
    const { user, token } = response.data

    if (!user || !token) throw new Error("Credenciales inválidas")

    localStorage.setItem("accessToken", token)
    setUser(user)
    setIsAuthenticated(true)
  }

  // Logout del usuario
  const logout = () => {
    localStorage.removeItem("accessToken")
    setUser(null)
    setIsAuthenticated(false)
  }

  // Verificar y refrescar token
  const checkToken = async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setIsAuthenticated(false)
      setUser(null)
      return
    }

    try {
      const response = await api.get<AuthResponse>("/auth/refresh", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const { user, token: newToken } = response.data

      if (user) setUser(user)
      setIsAuthenticated(true)

      if (newToken) localStorage.setItem("accessToken", newToken)
    } catch (error: any) {
      console.error("Token refresh error:", error)
      logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        checkToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

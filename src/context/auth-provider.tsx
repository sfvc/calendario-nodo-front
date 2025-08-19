import { useState, type ReactNode } from "react"
import { AuthContext } from "./auth-context"
import api from "@/lib/api"
import type { AuthResponse, LoginForm, User } from "./auth-types"
// import { useNavigate } from "react-router-dom"

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  // const navegate = useNavigate()

  // Login del usuario
  const login = async (form: LoginForm): Promise<void> => {

      console.log("📌 Enviando request con:", form);
  
      const response = await api.post<AuthResponse>("/auth/login", form);
      console.log("📌 Respuesta recibida:", response);
  
      const { user, token } = response.data;
      console.log("📌 user:", user, " token:", token);
  
      if (!user || !token) {
        console.log("❌ user/token inválidos");
        throw new Error("Credenciales inválidas");
      }
  
      localStorage.setItem("accessToken", token);
      setUser(user);
      setIsAuthenticated(true);

    // try {
    //     console.log("📌 Enviando request con:", form);
    
    //     const response = await api.post<AuthResponse>("/auth/login", form);
    //     console.log("📌 Respuesta recibida:", response);
    
    //     const { user, token } = response.data;
    //     console.log("📌 user:", user, " token:", token);
    
    //     if (!user || !token) {
    //       console.log("❌ user/token inválidos");
    //       throw new Error("Credenciales inválidas");
    //     }
    
    //     localStorage.setItem("accessToken", token);
    //     setUser(user);
    //     setIsAuthenticated(true);
    // }

    // catch (error: any) {
    //   navegate("/")
    // }

    console.log("✅ Login completado y estado seteado");
  };

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

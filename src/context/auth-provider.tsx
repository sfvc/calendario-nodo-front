import {
  useState,
  type ReactNode,
} from "react"
import { AuthContext } from "./auth-context"
import api from "@/lib/api"
import type { AuthResponse, LoginForm, User } from "./auth-types"

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const login = async (form: LoginForm) => {
    try {
      const response = await api.post('/auth/login', form)
      const { user, token }: AuthResponse = response.data
  
      if(!user || !token) return 
  
      localStorage.setItem("accessToken", token)
      setUser(user)
      setIsAuthenticated(true)
    } catch (error) {
      console.log(error)
    }
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    setUser(null)
    setIsAuthenticated(false)
  }

  const checkToken = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return setIsAuthenticated(false)

    try {
      const response = await api.get("/auth/refresh");
      const { user, token }: AuthResponse = response.data

      setUser(user);
      setIsAuthenticated(true);

      if(token) {
        localStorage.setItem("accessToken", token);
      }
    } catch (error) {
      console.log(error)
      logout();
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



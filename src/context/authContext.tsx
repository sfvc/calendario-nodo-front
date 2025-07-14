import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"

type AuthContextType = {
  isAuthenticated: boolean
  token: string | null
  userEmail: string | null
  userRole: string | null
  userId: string | null // <-- agrega esto
  login: (token: string, email: string, role: string, id: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedEmail = localStorage.getItem("userEmail")
    const storedRole = localStorage.getItem("userRole")
    const storedId = localStorage.getItem("userId")

    if (storedToken) setToken(storedToken)
    if (storedEmail) setUserEmail(storedEmail)
    if (storedRole) setUserRole(storedRole)
    if (storedId) setUserId(storedId)
  }, [])

  const login = (newToken: string, email: string, role: string, id: string) => {
    localStorage.setItem("token", newToken)
    localStorage.setItem("userEmail", email)
    localStorage.setItem("userRole", role)
    localStorage.setItem("userId", id)
    setToken(newToken)
    setUserEmail(email)
    setUserRole(role)
    setUserId(id)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    setToken(null)
    setUserEmail(null)
    setUserRole(null)
    setUserId(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        userEmail,
        userRole,
        userId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

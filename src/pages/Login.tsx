import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Label } from "../components/ui/Label";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Eye, EyeOff, Lock, Mail } from "../components/Icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context";
import type { LoginForm } from "@/context/auth-types";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Reincorporamos isLoading

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📌 handleSubmit disparado", formData); // <-- debug
    setIsLoading(true);

    try {
      console.log("📌 Intentando login...");
      await login(formData);
      console.log("✅ Login exitoso, navegando...");
      toast.success("Inicio de sesión exitoso 🎉");
      navigate("/");
    } catch (error: any) {
      console.log("❌ Error atrapado en handleSubmit:", error);

      if (error.response?.status === 401 || error.message === "Credenciales inválidas") {
        toast.error("Correo o contraseña incorrectos ❌");
      } else {
        toast.error("Ocurrió un error inesperado 😓");
      }
    } finally {
      console.log("🔄 Terminó el proceso de login (finally)");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center">
              <img src="/nodo-calendario.avif" alt="" width={300}/>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Bienvenido de vuelta
              </CardTitle>
              <CardDescription className="text-gray-600">
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading} // El botón se deshabilita durante la carga
                  className="w-full h-12 bg-gradient-to-r botonazul hover:from-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>

                <Link
                  to="/"
                  className="h-12 px-6 w-full rounded-lg inline-flex items-center justify-center text-blue-400"
                >
                  Volver a inicio
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
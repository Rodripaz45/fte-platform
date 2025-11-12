"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rol, setRol] = useState("PARTICIPANTE");
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      console.log('🚀 [AUTH] Iniciando proceso de login...');
      
      // 1. Hacer login y obtener el token
      const response = await authApi.login(email, password);
      console.log('✅ [AUTH] Login exitoso, token recibido');
      
      // 2. Guardar el token primero en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.access_token);
        console.log('💾 [AUTH] Token guardado en localStorage');
      }
      
      // 3. Obtener información del usuario usando el token recién obtenido
      const userInfo = await authApi.getCurrentUser(response.access_token);
      console.log('✅ [AUTH] Información del usuario obtenida');
      
      // 4. Guardar en el contexto global
      login(response.access_token, userInfo);
      console.log('✅ [AUTH] Sesión guardada en contexto');
      
      router.push("/dashboard");
    } catch (err) {
      console.error('❌ [AUTH] Error en login:', err);
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const nombre = formData.get("nombre") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      console.log('🚀 [AUTH] Iniciando proceso de registro...');
      
      // 1. Registrar usuario y obtener el token
      const response = await authApi.register(
        nombre,
        email,
        password,
        rol || undefined
      );
      console.log('✅ [AUTH] Registro exitoso, token recibido');
      
      // 2. Guardar el token primero en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.access_token);
        console.log('💾 [AUTH] Token guardado en localStorage');
      }
      
      // 3. Obtener información del usuario usando el token recién obtenido
      const userInfo = await authApi.getCurrentUser(response.access_token);
      console.log('✅ [AUTH] Información del usuario obtenida');
      
      // 4. Guardar en el contexto global
      login(response.access_token, userInfo);
      console.log('✅ [AUTH] Sesión guardada en contexto');
      
      router.push("/dashboard");
    } catch (err) {
      console.error('❌ [AUTH] Error en registro:', err);
      setError(err instanceof Error ? err.message : "Error al registrarse");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Sistema de Talleres</CardTitle>
            <CardDescription>
              Gestión integral de talleres y participantes
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-nombre">Nombre Completo</Label>
                  <Input
                    id="register-nombre"
                    name="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-rol">Rol</Label>
                  <Select value={rol} onValueChange={setRol}>
                    <SelectTrigger id="register-rol">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PARTICIPANTE">Participante</SelectItem>
                      <SelectItem value="TRAINER">Capacitador</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registrando..." : "Crear Cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

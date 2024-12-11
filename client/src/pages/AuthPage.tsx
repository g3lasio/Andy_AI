import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { toast } from "@/hooks/use-toast";

type FormData = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ssn?: string;
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useUser();
  const form = useForm<FormData>({
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (isLogin) {
        await login(data);
      } else {
        await register(data);
      }
      toast({
        title: isLogin ? "Inicio de sesión exitoso" : "Registro exitoso",
        description: "Bienvenido a Andy AI"
      });
    } catch (error: any) {
      const errorMessage = error.message || "Error durante la autenticación";
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Andy AI</h1>
          <p className="text-muted-foreground mt-2">
            Tu asistente financiero personal
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {!isLogin && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName", { required: !isLogin })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName", { required: !isLogin })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email", { required: !isLogin })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Teléfono</Label>
                  <Input
                    id="phoneNumber"
                    {...form.register("phoneNumber")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register("dateOfBirth")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    {...form.register("state")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    {...form.register("zipCode")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ssn">SSN (Últimos 4 dígitos)</Label>
                <Input
                  id="ssn"
                  maxLength={4}
                  {...form.register("ssn")}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <div className="relative">
              <Input
                id="username"
                {...form.register("username", { required: true })}
              />
              {form.formState.isValid && form.getValues("username") && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...form.register("password", { required: true })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <Eye className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {isLogin && (
            <Button
              variant="link"
              type="button"
              onClick={() => toast({
                title: "Recuperar contraseña",
                description: "Función en desarrollo. Próximamente disponible."
              })}
              className="text-sm px-0"
            >
              ¿Olvidaste tu contraseña?
            </Button>
          )}

          <Button type="submit" className="w-full">
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm"
          >
            {isLogin
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

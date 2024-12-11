import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-user";
import { toast } from "@/hooks/use-toast";

type FormData = {
  username: string;
  password: string;
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useUser();
  const form = useForm<FormData>();

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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
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
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              {...form.register("username", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password", { required: true })}
            />
          </div>

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

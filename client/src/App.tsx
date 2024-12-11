import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

function AppContent() {
  // Usuario temporal para desarrollo
  const tempUser = {
    id: 1,
    username: "usuario_prueba",
    name: "Usuario de Prueba"
  };

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route>404 - Página no encontrada</Route>
    </Switch>
  );
}

export default App;

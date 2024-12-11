import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route>404 - Página no encontrada</Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

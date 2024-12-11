import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreditScore from "@/components/CreditScore";
import FinancialOverview from "@/components/FinancialOverview";
import TransactionList from "@/components/TransactionList";
import AIChat from "@/components/AIChat";
import { useUser } from "@/hooks/use-user";
import { useFinancialData } from "@/hooks/use-financial-data";

export default function Dashboard() {
  const { user } = useUser();
  const { creditScore, transactions, loading } = useFinancialData();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      <div className="container mx-auto p-4 relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10"></div>
        <header className="mb-8 neon-glow">
          <h1 className="text-4xl font-bold text-foreground">
            Bienvenido, {user?.name || user?.username}
          </h1>
          <p className="text-muted-foreground">
            Tu asistente financiero personal está aquí para ayudarte
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <CreditScore score={creditScore} loading={loading} />
          </Card>
          
          <Card className="p-6 md:col-span-2">
            <FinancialOverview />
          </Card>

          <Card className="p-6 col-span-full">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Plan de Acción Personalizado</h2>
              <p className="text-muted-foreground">
                Basado en tu perfil financiero, Andy AI ha creado un plan personalizado:
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Mejora de Crédito</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Identificar y disputar reportes negativos</li>
                    <li>• Plan de pagos para mejorar historial</li>
                    <li>• Estrategias para aumentar límites</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Optimización de Gastos</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Análisis de gastos hormiga</li>
                    <li>• Revisión de suscripciones</li>
                    <li>• Detección de gastos duplicados</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Oportunidades de Crecimiento</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Opciones de inversión personalizadas</li>
                    <li>• Estrategias de ingresos pasivos</li>
                    <li>• Metas financieras a largo plazo</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="credit">Crédito</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
            <TabsTrigger value="planning">Planificación</TabsTrigger>
            <TabsTrigger value="ai">Andy AI</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="p-6">
              <FinancialOverview detailed />
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="p-6">
              <TransactionList transactions={transactions} />
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card className="p-6">
              <AIChat />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <header className="mb-8">
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
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

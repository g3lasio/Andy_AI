import { Card } from "@/components/ui/card";
import { useFinancialData } from "@/hooks/use-financial-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface FinancialOverviewProps {
  detailed?: boolean;
}

export default function FinancialOverview({ detailed = false }: FinancialOverviewProps) {
  const { balance, income, expenses, trends } = useFinancialData();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Resumen Financiero</h2>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Balance Total</div>
          <div className="text-2xl font-bold">${balance.toLocaleString()}</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Ingresos Mensuales</div>
          <div className="text-2xl font-bold text-green-500">
            ${income.toLocaleString()}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Gastos Mensuales</div>
          <div className="text-2xl font-bold text-red-500">
            ${expenses.toLocaleString()}
          </div>
        </Card>
      </div>

      {detailed && (
        <div className="h-[300px] mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import type { Transaction, CreditReport } from "@db/schema";

interface FinancialData {
  creditScore: number;
  balance: number;
  income: number;
  expenses: number;
  transactions: Transaction[];
  trends: Array<{
    date: string;
    balance: number;
  }>;
  loading: boolean;
}

export function useFinancialData(): FinancialData {
  const { data: creditData, isLoading: creditLoading } = useQuery<CreditReport>({
    queryKey: ["/api/credit/score"],
  });

  const { data: transactionData, isLoading: transactionLoading } = useQuery<{
    balance: number;
    income: number;
    expenses: number;
    transactions: Transaction[];
    trends: Array<{ date: string; balance: number }>;
  }>({
    queryKey: ["/api/transactions/summary"],
  });

  return {
    creditScore: creditData?.score ?? 0,
    balance: transactionData?.balance ?? 0,
    income: transactionData?.income ?? 0,
    expenses: transactionData?.expenses ?? 0,
    transactions: transactionData?.transactions ?? [],
    trends: transactionData?.trends ?? [],
    loading: creditLoading || transactionLoading,
  };
}

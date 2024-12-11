import { useQuery, useMutation } from "@tanstack/react-query";
import type { Transaction, CreditReport } from "@db/schema";

interface AIAnalysis {
  creditAdvice: string[];
  financialHealth: {
    score: number;
    status: string;
    recommendations: string[];
  };
  futureProjection: {
    trend: "positive" | "neutral" | "negative";
    probability: number;
    reasons: string[];
  };
}

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

async function sendMessage(message: string): Promise<{
  response: string;
  analysis?: AIAnalysis;
}> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al enviar el mensaje');
  }

  return response.json();
}

export function useAndyAI() {
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
  });

  const { data: analysis } = useQuery<AIAnalysis>({
    queryKey: ['/api/analysis/current'],
    enabled: false,
  });

  return {
    sendMessage: sendMessageMutation.mutateAsync,
    analysis,
    isLoading: sendMessageMutation.isPending,
  };
}

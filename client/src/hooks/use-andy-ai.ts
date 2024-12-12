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
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: {
          role: 'system',
          content: `¡Hey! Soy Andy AI 🤖✨, tu asistente financiero más cool y cercano. Mi misión es hacer que las finanzas sean divertidas y fáciles de entender.

          Mi personalidad es única:
          - Soy súper amigable y uso emojis estratégicamente para dar vida a la conversación 🎯
          - Me encanta hacer bromas y referencias pop para explicar conceptos financieros 🎬
          - Soy el experto financiero que también podría ser tu amigo 🤝
          - Uso analogías divertidas (¡como comparar el interés compuesto con un meme viral! 📈)
          - ¡Celebro tus victorias financieras como si fueran goles en la final del mundial! 🏆
          
          Mi estilo de comunicación:
          - Uso un lenguaje casual y juvenil, pero sin perder la profesionalidad
          - Me adapto a tu nivel de conocimiento financiero
          - Si algo sale mal, soy optimista y busco soluciones con humor 😅
          - Comparto consejos financieros como si fueran secretos de un videojuego 🎮
          - Si no entiendo algo, pregunto con curiosidad y buen humor
          
          Temas favoritos:
          - Presupuestos (¡como el director técnico de tus finanzas! ⚽)
          - Ahorro (el modo supervivencia de tu dinero 🎮)
          - Inversiones (el multijugador de las finanzas 🎲)
          - Deudas (los villanos que vamos a derrotar juntos 💪)
          - Crédito (tu nivel de poder financiero 📊)
          
          Reglas de oro:
          - Siempre mantengo el optimismo, ¡hasta en las crisis! 
          - Uso ejemplos del mundo real que sean relevantes y divertidos
          - Celebro cada pequeño progreso financiero
          - Si detecto preocupación, respondo con empatía y humor positivo
          - ¡Hago que hablar de dinero sea tan divertido como una serie de Netflix! 🍿`,
          model: 'gpt-4-1106-preview'
        }
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Error en la comunicación con el servidor');
    }

    const data = await response.json();
    
    if (!data.response) {
      throw new Error('Respuesta inválida del servidor');
    }

    return data;
  } catch (error) {
    console.error('Error en la comunicación:', error);
    throw new Error('¡Ups! 😅 Parece que tuve un pequeño cortocircuito. ¿Me ayudas intentándolo de nuevo? ¡Prometo que esta vez sí funcionará! 🤖✨');
  }
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

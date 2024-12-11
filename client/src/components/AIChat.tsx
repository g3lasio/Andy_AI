import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useAndyAI } from "@/hooks/use-andy-ai";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export default function AIChat() {
  const { sendMessage, analysis, isLoading } = useAndyAI();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy Andy AI, tu asistente financiero personal. ¿En qué puedo ayudarte hoy?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const result = await sendMessage(input);
      
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: result.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Chat con Andy AI</h2>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <Card
                className={`max-w-[80%] p-3 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.text}
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      {analysis && (
        <Card className="mb-4 p-4 bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">Análisis Financiero</h3>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Salud Financiera
              </h4>
              <p className="text-sm text-muted-foreground">
                {analysis.financialHealth.status}
              </p>
            </div>

            <div>
              <h4 className="font-medium flex items-center gap-2">
                {analysis.futureProjection.trend === 'positive' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : analysis.futureProjection.trend === 'negative' ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                )}
                Proyección Futura
              </h4>
              <p className="text-sm text-muted-foreground">
                {analysis.futureProjection.reasons[0]}
              </p>
            </div>

            <div>
              <h4 className="font-medium">Consejo Principal</h4>
              <p className="text-sm text-muted-foreground">
                {analysis.creditAdvice[0]}
              </p>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

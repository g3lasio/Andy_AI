import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";
import { useUser } from "@/hooks/use-user";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  isTyping?: boolean;
}

interface OnboardingState {
  currentStep: 'welcome' | 'financial_goals' | 'income' | 'expenses' | 'credit' | 'complete';
  data: {
    financialGoals?: string[];
    monthlyIncome?: number;
    monthlyExpenses?: number;
    hasCredits?: boolean;
    creditScore?: number;
  };
}

export default function OnboardingChat() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    currentStep: 'welcome',
    data: {}
  });

  useEffect(() => {
    // Initial welcome message
    const welcomeMessage = {
      id: 1,
      text: `¡Hola ${user?.firstName || 'amigo'}! 👋✨
      
Soy Andy AI, tu asistente financiero personal, y estoy aquí para ayudarte a comenzar tu viaje hacia una mejor salud financiera. 🌟

Para poder brindarte la mejor asesoría posible, necesito conocer un poco más sobre tu situación financiera actual. ¿Te parece si comenzamos con algunas preguntas sencillas?

Por favor, cuéntame, ¿cuáles son tus principales objetivos financieros? Por ejemplo:
• Ahorrar para una casa 🏠
• Mejorar tu puntaje crediticio 📈
• Crear un fondo de emergencia 🛟
• Invertir para el futuro 📊

¡No te preocupes, estoy aquí para guiarte paso a paso! 😊`,
      sender: 'ai'
    };
    setMessages([welcomeMessage]);
  }, [user]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (files: FileList) => {
    if (files.length > 5) {
      alert("Solo puedes subir hasta 5 archivos a la vez");
      return;
    }
    setSelectedFiles(Array.from(files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Show typing indicator
    const typingMessage: Message = {
      id: Date.now() + 1,
      text: "Andy está escribiendo... ✨",
      sender: 'ai',
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          currentStep: onboardingState.currentStep,
          onboardingData: onboardingState.data
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      // Remove typing indicator and add AI response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isTyping);
        return [...filtered, {
          id: Date.now() + 2,
          text: result.response,
          sender: 'ai'
        }];
      });

      // Update onboarding state if provided
      if (result.nextStep) {
        setOnboardingState(prev => ({
          ...prev,
          currentStep: result.nextStep,
          data: { ...prev.data, ...result.updatedData }
        }));
      }

      // Play notification sound
      new Audio('/notification.mp3').play().catch(console.error);

    } catch (error) {
      console.error('Error en el chat:', error);
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isTyping);
        return [...filtered, {
          id: Date.now() + 2,
          text: "¡Ups! 😅 Tuve un pequeño problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?",
          sender: 'ai'
        }];
      });
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      <Card className="flex-1 p-4">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
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
                      : message.isTyping
                      ? 'bg-muted animate-pulse'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {message.sender === 'ai' && !message.isTyping && '🤖 '}
                    {message.text}
                  </div>
                  {message.isTyping && (
                    <div className="flex gap-1 mt-1">
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".pdf,.jpg,.png,.csv"
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          max="5"
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1"
          disabled={false}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={!input.trim() || isAnalyzing}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

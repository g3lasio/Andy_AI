import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAndyAI } from "@/hooks/use-andy-ai";
import { useUser } from "@/hooks/use-user";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  isAnalyzing?: boolean;
  isTyping?: boolean;
}

interface AIChatProps {
  className?: string;
}

export default function AIChat({ className }: AIChatProps) {
  const { user } = useUser();
  const { sendMessage, analysis, isLoading } = useAndyAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, type: string, url: string}>>([]);

  useEffect(() => {
    const greeting: Message = {
      id: 1,
      text: `¡Hola ${user?.firstName || 'amigo'}! 👋✨ ¡Qué alegría verte por aquí! 

🤖 Soy Andy AI, tu asistente financiero personal más cool y amigable. ¡Estoy aquí para ayudarte a tomar el control de tus finanzas de una manera divertida! 

Para comenzar nuestro viaje financiero juntos, me encantaría analizar algunos documentos importantes:

📄 Estados de cuenta bancarios
   → Los encuentras en tu app bancaria o email mensual
📊 Reportes de crédito
   → Puedes obtenerlos gratis en Buró de Crédito
💳 Estados de tarjetas de crédito
   → En tu app de banco o email mensual
🧾 Facturas y recibos importantes
   → Los que consideres relevantes

¡No te preocupes! Puedes adjuntar los documentos usando el clip 📎 que está justo abajo a la izquierda. ¡Prometo cuidar muy bien de tu información! 😊

¿Te gustaría empezar compartiendo alguno de estos documentos? ¡Estoy super emocionado por ayudarte! 🌟`,
      sender: 'ai'
    };
    setMessages([greeting]);
  }, [user]);

  const handleFileSelect = (files: FileList) => {
    if (files.length > 5) {
      alert("Solo puedes subir hasta 5 archivos a la vez");
      return;
    }
    setSelectedFiles(Array.from(files));
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Error al subir archivos');
      
      const result = await response.json();
      setUploadedFiles(prev => [...prev, ...result.files]);
      
      // Simular proceso de análisis
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "🔍 Analizando documentos minuciosamente...",
        sender: 'ai',
        isAnalyzing: true
      }]);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const analysis = `📊 *Análisis Financiero Detallado*

1. Resumen de Gastos:
   ├── Gastos Fijos: $X,XXX
   ├── Gastos Variables: $X,XXX
   └── Gastos Superfluos: $X,XXX

2. Hábitos Financieros Detectados:
   ⚠️ Áreas de Preocupación:
   • Gasto excesivo en entretenimiento
   • Pagos tardíos de tarjetas
   • Bajo ahorro mensual

3. Proyección a 3 Meses:
   Si mantienes estos hábitos:
   📉 Deuda proyectada: +45%
   💰 Ahorro proyectado: -60%

4. Recomendaciones Inmediatas:
   ✅ Reducir gastos en entretenimiento
   ✅ Establecer pagos automáticos
   ✅ Crear fondo de emergencia

¿Te gustaría que profundicemos en algún aspecto específico? 🤔`;

      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        text: analysis,
        sender: 'ai'
      }]);
      
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "¡Ups! 😅 Hubo un problema al procesar los archivos. ¿Podrías intentarlo de nuevo?",
        sender: 'ai'
      }]);
    } finally {
      setIsAnalyzing(false);
      setSelectedFiles([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Mensaje de "escribiendo..."
    const typingMessage: Message = {
      id: Date.now() + 1,
      text: "Andy está escribiendo... ✨",
      sender: 'ai',
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const result = await sendMessage(userMessage.text);
      
      // Eliminar mensaje de "escribiendo..." y agregar respuesta
      setMessages(prev => {
        const filteredMessages = prev.filter(m => !m.isTyping);
        return [...filteredMessages, {
          id: Date.now() + 2,
          text: result.response,
          sender: 'ai'
        }];
      });

      // Reproducir sonido de notificación
      new Audio('/notification.mp3').play().catch(console.error);
    } catch (error) {
      setMessages(prev => {
        const filteredMessages = prev.filter(m => !m.isTyping);
        return [...filteredMessages, {
          id: Date.now() + 2,
          text: "¡Oops! 😅 Parece que tuve un pequeño problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo? ¡Prometo hacerlo mejor esta vez! 🙏",
          sender: 'ai'
        }];
      });
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <Card className="flex-1 p-4">
        <ScrollArea className="h-full pr-4">
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1"
          disabled={isAnalyzing}
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
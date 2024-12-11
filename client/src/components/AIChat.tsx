
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
}

export default function AIChat() {
  const { user } = useUser();
  const { sendMessage, analysis, isLoading } = useAndyAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, type: string, url: string}>>([]);

  useEffect(() => {
    const greeting = {
      id: 1,
      text: `¡Hola ${user?.name || 'amigo'}! 👋 Soy Andy AI, tu asistente financiero personal super amigable! 🤖✨ 
      \nPara ayudarte mejor, necesitaré algunos documentos como:
      \n📄 Estados de cuenta bancarios
      \n📊 Reportes de crédito
      \n💳 Estados de tarjetas de crédito
      \n¿Te gustaría empezar compartiendo alguno de estos documentos? Puedes usar el clip 📎 para adjuntarlos.`,
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

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "🤔 Procesando información financiera...",
        sender: 'ai',
        isAnalyzing: true
      }]);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const analysis = `📊 *Análisis Financiero Detallado*\n\n
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
    if (!input.trim() || isLoading || isAnalyzing) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user'
    };

    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const result = await sendMessage(input);
      
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: result.response,
        sender: 'ai'
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "¡Oops! 😅 Tuve un pequeño tropiezo. ¿Podrías repetir eso?",
        sender: 'ai'
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Chat con Andy AI</h2>

      {selectedFiles.length > 0 && (
        <Card className="mb-4 p-4">
          <h3 className="text-sm font-medium mb-2">Archivos seleccionados:</h3>
          <div className="grid gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
                <Badge variant="secondary">{(file.size / 1024).toFixed(1)}KB</Badge>
              </div>
            ))}
          </div>
          <Button 
            onClick={handleFileUpload} 
            className="mt-2"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              'Procesar Archivos'
            )}
          </Button>
        </Card>
      )}

      {uploadedFiles.length > 0 && (
        <Card className="mb-4 p-4">
          <h3 className="text-lg font-semibold mb-2">📚 Documentos en Knowledge Andy</h3>
          <div className="grid gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
                <Badge variant="secondary">{file.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

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
                    : message.isAnalyzing
                    ? 'bg-muted animate-pulse'
                    : 'bg-muted'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.text}</div>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

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
        <Button type="submit" disabled={isLoading || isAnalyzing}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

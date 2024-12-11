
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, TrendingUp, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAndyAI } from "@/hooks/use-andy-ai";
import { useUser } from "@/hooks/use-user";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export default function AIChat() {
  const { user } = useUser();
  const { sendMessage, analysis, isLoading } = useAndyAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, type: string, url: string}>>([]);

  useEffect(() => {
    // Initial greeting
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

  const handleFileUpload = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
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
      
      const aiResponse: Message = {
        id: Date.now(),
        text: `¡Excelente! 🎉 He recibido los siguientes archivos:\n${Array.from(files).map(f => `📄 ${f.name}`).join('\n')}\n\n${result.analysis}\n\n¿Hay algo específico que te gustaría saber sobre estos documentos? 🤓`,
        sender: 'ai'
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now(),
        text: "¡Ups! 😅 Parece que hubo un pequeño problema al procesar los archivos. ¿Podrías intentarlo de nuevo?",
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user'
    };

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
                    : 'bg-muted'
                }`}
              >
                {message.text}
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
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
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

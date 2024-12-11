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

  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, type: string, url: string}>>([]);

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
    
    // Add uploaded files to state
    setUploadedFiles(prev => [...prev, ...result.files]);
    
    // Generate AI analysis message
    const aiResponse: Message = {
      id: Date.now(),
      text: `He analizado los siguientes archivos:\n${Array.from(files).map(f => `- ${f.name}`).join('\n')}\n\n${result.analysis}`,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiResponse]);
  } catch (error) {
    console.error('Error:', error);
    toast({
      title: "Error",
      description: "No se pudieron procesar los archivos",
      variant: "destructive"
    });
  }
};

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

      {uploadedFiles.length > 0 && (
        <Card className="mb-4 p-4">
          <h3 className="text-lg font-semibold mb-2">Archivos Analizados</h3>
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

      <div className="flex items-center gap-2 mb-4">
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.png"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
      </div>
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


import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function CreditReportUpload() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('report', file);
    formData.append('bureau', 'manual');
    formData.append('date', new Date().toISOString());

    setLoading(true);
    try {
      const response = await fetch('/api/credit/upload-report', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Error al subir el reporte');
      
      toast({
        title: "Reporte subido exitosamente",
        description: "Andy AI analizará tu reporte y generará un diagnóstico."
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir el reporte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-2">Subir Reporte de Crédito</h3>
      <input
        type="file"
        accept=".pdf,.jpg,.png"
        onChange={handleFileUpload}
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
        disabled={loading}
      />
    </Card>
  );
}

import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CreditScoreProps {
  score?: number;
  loading?: boolean;
}

export default function CreditScore({ score = 0, loading = false }: CreditScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 700) return "text-green-500";
    if (score >= 600) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreText = (score: number) => {
    if (score >= 700) return "Excelente";
    if (score >= 600) return "Bueno";
    return "Necesita mejorar";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Puntaje Crediticio</h2>
      
      <div className="text-center mb-4">
        <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
        <p className="text-muted-foreground">{getScoreText(score)}</p>
      </div>

      <Progress value={(score / 850) * 100} className="h-2 mb-4" />

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>300</span>
        <span>850</span>
      </div>
    </div>
  );
}

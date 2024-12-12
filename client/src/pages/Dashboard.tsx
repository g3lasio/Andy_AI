import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import AIChat from "@/components/AIChat";
import CreditScore from "@/components/CreditScore";
import FinancialOverview from "@/components/FinancialOverview";
import { useUser } from "@/hooks/use-user";
import { useFinancialData } from "@/hooks/use-financial-data";
import { 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  AlertTriangle,
  FileText,
  PiggyBank,
  Bell,
  Target,
  BarChart2
} from "lucide-react";

interface OrbitalItem {
  id: string;
  icon: JSX.Element;
  title: string;
  description: string;
  angle: number;
  radius: number;
}

export default function Dashboard() {
  const { user } = useUser();
  const { creditScore, loading } = useFinancialData();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Orbital elements configuration
  const orbitals = [
    {
      id: "credit",
      icon: <CreditCard className="w-6 h-6" />,
      title: "Crédito",
      items: [
        {
          id: "credit-score",
          icon: <BarChart2 className="w-5 h-5" />,
          title: "Puntaje",
          route: "/credit/score"
        },
        {
          id: "credit-report",
          icon: <FileText className="w-5 h-5" />,
          title: "Reporte",
          route: "/credit/report"
        },
        {
          id: "credit-improvement",
          icon: <TrendingUp className="w-5 h-5" />,
          title: "Mejoras",
          route: "/credit/improvement"
        }
      ]
    },
    {
      id: "finances",
      icon: <Wallet className="w-6 h-6" />,
      title: "Finanzas",
      items: [
        {
          id: "expenses",
          icon: <PiggyBank className="w-5 h-5" />,
          title: "Gastos",
          route: "/finances/expenses"
        },
        {
          id: "goals",
          icon: <Target className="w-5 h-5" />,
          title: "Metas",
          route: "/finances/goals"
        },
        {
          id: "alerts",
          icon: <Bell className="w-5 h-5" />,
          title: "Alertas",
          route: "/finances/alerts"
        }
      ]
    }
  ];

  const calculatePosition = (angle: number, radius: number) => ({
    x: Math.cos((angle * Math.PI) / 180) * radius,
    y: Math.sin((angle * Math.PI) / 180) * radius,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black overflow-hidden">
      <div className="container mx-auto p-4 relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-600">
            Bienvenido, {user?.firstName || user?.username}
          </h1>
        </header>

        <div className="relative w-full h-[800px] flex items-center justify-center">
          {/* Centro - Andy AI */}
          <motion.div 
            className="absolute z-30 w-48 h-48 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
          >
            <div className="relative w-full h-full">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 opacity-20 blur-xl" />
              
              {/* Icon container */}
              <motion.div
                className="relative w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600 p-0.5"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full rounded-full overflow-hidden backdrop-blur-md bg-zinc-950/90 flex items-center justify-center">
                  {isAIChatOpen ? (
                    <AIChat className="w-full h-full p-2" />
                  ) : (
                    <img 
                      src="/Andy-icon white.png" 
                      alt="Andy AI"
                      className="w-24 h-24 object-contain"
                    />
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Orbital Rings */}
          {orbitals.map((section, sectionIndex) => (
            <div key={section.id} className="absolute inset-0">
              {/* Orbital Ring */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 100 + sectionIndex * 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 border border-blue-500/10 rounded-full" 
                     style={{ 
                       transform: `scale(${0.7 + sectionIndex * 0.2})`,
                     }} 
                />
              </motion.div>

              {/* Orbital Items */}
              {section.items.map((item, i) => {
                const angle = (360 / section.items.length) * i;
                const radius = 150 + sectionIndex * 80;
                const position = {
                  x: Math.cos((angle * Math.PI) / 180) * radius,
                  y: Math.sin((angle * Math.PI) / 180) * radius,
                };

                return (
                  <motion.div
                    key={item.id}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      x: position.x - 24,
                      y: position.y - 24,
                    }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <motion.button
                      className="w-12 h-12 rounded-full bg-zinc-900/80 border border-blue-500/20 backdrop-blur-sm
                               flex flex-col items-center justify-center gap-1 group relative"
                      whileHover={{
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                        borderColor: "rgba(59, 130, 246, 0.5)",
                      }}
                      onClick={() => setExpandedSection(item.id)}
                    >
                      <div className="text-blue-500 group-hover:text-blue-400 transition-colors">
                        {item.icon}
                      </div>
                      <span className="absolute -bottom-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.title}
                      </span>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

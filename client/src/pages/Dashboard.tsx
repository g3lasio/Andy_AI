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

  // Primer anillo - Funciones principales
  const primaryOrbitals: OrbitalItem[] = [
    {
      id: "credit",
      icon: <CreditCard className="w-8 h-8" />,
      title: "Monitoreo de Crédito",
      description: "Seguimiento y mejora de tu puntaje crediticio",
      angle: 0,
      radius: 180
    },
    {
      id: "finances",
      icon: <Wallet className="w-8 h-8" />,
      title: "Finanzas Personales",
      description: "Gestión de ingresos y gastos",
      angle: 180,
      radius: 180
    }
  ];

  // Segundo anillo - Subfunciones
  const secondaryOrbitals: OrbitalItem[] = [
    // Crédito
    {
      id: "credit-report",
      icon: <FileText className="w-6 h-6" />,
      title: "Reporte de Crédito",
      description: "Revisa tu historial crediticio",
      angle: 315,
      radius: 280
    },
    {
      id: "credit-improvement",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Mejora de Puntaje",
      description: "Estrategias para mejorar tu crédito",
      angle: 45,
      radius: 280
    },
    {
      id: "credit-alerts",
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Alertas",
      description: "Notificaciones importantes",
      angle: 0,
      radius: 280
    },
    // Finanzas
    {
      id: "savings",
      icon: <PiggyBank className="w-6 h-6" />,
      title: "Ahorros",
      description: "Metas y estrategias de ahorro",
      angle: 135,
      radius: 280
    },
    {
      id: "notifications",
      icon: <Bell className="w-6 h-6" />,
      title: "Notificaciones",
      description: "Actualizaciones financieras",
      angle: 180,
      radius: 280
    },
    {
      id: "goals",
      icon: <Target className="w-6 h-6" />,
      title: "Objetivos",
      description: "Metas financieras",
      angle: 225,
      radius: 280
    }
  ];

  const calculatePosition = (angle: number, radius: number) => ({
    x: Math.cos((angle * Math.PI) / 180) * radius,
    y: Math.sin((angle * Math.PI) / 180) * radius,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 overflow-hidden">
      <div className="container mx-auto p-4 relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        
        <header className="mb-8 neon-glow text-center">
          <h1 className="text-4xl font-bold text-foreground">
            Bienvenido, {user?.firstName || user?.username}
          </h1>
          <p className="text-gray-200">
            Tu asistente financiero personal está aquí para ayudarte
          </p>
        </header>

        <div className="relative w-full h-[800px] flex items-center justify-center">
          {/* Centro - Andy AI */}
          <div className="absolute z-20 w-64 h-64">
            <motion.div
              className="w-full h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 p-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Card className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden backdrop-blur-sm bg-black/50">
                <div className="absolute inset-0 bg-gradient-radial from-violet-500/20 to-transparent" />
                <AIChat className="w-full h-full" />
              </Card>
            </motion.div>
          </div>

          {/* Anillo orbital primario */}
          {primaryOrbitals.map((item) => {
            const position = calculatePosition(item.angle, item.radius);
            return (
              <motion.div
                key={item.id}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                animate={{
                  x: position.x,
                  y: position.y,
                  scale: expandedSection === item.id ? 1.1 : 1,
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="w-24 h-24 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-violet-900/20 transition-colors"
                  onClick={() => setExpandedSection(item.id)}
                >
                  {item.icon}
                  <span className="text-xs mt-2">{item.title}</span>
                </Card>
              </motion.div>
            );
          })}

          {/* Anillo orbital secundario */}
          {secondaryOrbitals.map((item) => {
            const position = calculatePosition(item.angle, item.radius);
            return (
              <motion.div
                key={item.id}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                animate={{
                  x: position.x,
                  y: position.y,
                  scale: expandedSection === item.id ? 1.1 : 1,
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="w-16 h-16 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-violet-900/20 transition-colors"
                  onClick={() => setExpandedSection(item.id)}
                >
                  {item.icon}
                  <span className="text-[10px] mt-1">{item.title}</span>
                </Card>
              </motion.div>
            );
          })}

          {/* Líneas de conexión animadas */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="w-full h-full rounded-full border border-violet-500/20"
              style={{ scale: 0.6 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="w-full h-full rounded-full border border-indigo-500/20"
              style={{ scale: 0.9 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import AIChat from "@/components/AIChat";
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

interface OrbitalConfig {
  id: string;
  radius: number;
  duration: number;
  items: {
    id: string;
    icon: JSX.Element;
    label: string;
  }[];
}

export default function Dashboard() {
  const { user } = useUser();
  const { creditScore, loading } = useFinancialData();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Configuración de los orbitales
  const orbitals: OrbitalConfig[] = [
    {
      id: "orbital1",
      radius: 120,
      duration: 25,
      items: [
        { id: "alerts", icon: <Bell className="w-4 h-4" />, label: "Alertas" },
        { id: "stats", icon: <BarChart2 className="w-4 h-4" />, label: "Estadísticas" },
        { id: "wallet", icon: <Wallet className="w-4 h-4" />, label: "Finanzas" },
      ]
    },
    {
      id: "orbital2",
      radius: 180,
      duration: 30,
      items: [
        { id: "credit", icon: <CreditCard className="w-4 h-4" />, label: "Crédito" },
        { id: "savings", icon: <PiggyBank className="w-4 h-4" />, label: "Ahorros" },
        { id: "goals", icon: <Target className="w-4 h-4" />, label: "Metas" },
        { id: "reports", icon: <FileText className="w-4 h-4" />, label: "Reportes" },
      ]
    },
    {
      id: "orbital3",
      radius: 240,
      duration: 35,
      items: [
        { id: "trends", icon: <TrendingUp className="w-4 h-4" />, label: "Tendencias" },
        { id: "investments", icon: <BarChart2 className="w-4 h-4" />, label: "Inversiones" },
        { id: "planning", icon: <Target className="w-4 h-4" />, label: "Planificación" },
        { id: "security", icon: <AlertTriangle className="w-4 h-4" />, label: "Seguridad" },
        { id: "notifications", icon: <Bell className="w-4 h-4" />, label: "Notificaciones" },
      ]
    }
  ];

  const calculatePosition = (angle: number, radius: number) => ({
    x: Math.cos((angle * Math.PI) / 180) * radius,
    y: Math.sin((angle * Math.PI) / 180) * radius,
  });

  return (
    <div className="min-h-screen bg-[#000000] overflow-hidden">
      <div className="container mx-auto p-4 relative">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-light text-white/80">
            Bienvenido, {user?.firstName || user?.username}
          </h1>
        </header>

        <div className="relative w-full h-[800px] flex items-center justify-center">
          {/* Fondo con gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent" />
          
          {/* Centro - Andy AI */}
          <motion.div 
            className="absolute z-30 w-32 h-32 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
          >
            <div className="relative w-full h-full">
              {/* Efecto de brillo */}
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl" />
              
              {/* Contenedor del ícono */}
              <div className="relative w-full h-full rounded-full border border-blue-500/20 backdrop-blur-sm bg-black/50 flex items-center justify-center overflow-hidden">
                {isAIChatOpen ? (
                  <AIChat className="w-full h-full p-2" />
                ) : (
                  <motion.div
                    className="w-full h-full flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <img 
                      src="/Andy-icon white.png" 
                      alt="Andy AI"
                      className="w-16 h-16 object-contain"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Anillos Orbitales */}
          {orbitals.map((orbital) => (
            <div key={orbital.id} className="absolute inset-0">
              {/* Anillo Orbital */}
              <div className="absolute inset-0">
                <motion.div
                  className="w-full h-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: orbital.duration, repeat: Infinity, ease: "linear" }}
                >
                  <div 
                    className="absolute inset-0 rounded-full border border-blue-500/10"
                    style={{ transform: `scale(${orbital.radius / 120})` }}
                  />
                </motion.div>
              </div>

              {/* Elementos Orbitales */}
              {orbital.items.map((item, index) => {
                const angle = (360 / orbital.items.length) * index;
                const position = calculatePosition(angle, orbital.radius);

                return (
                  <motion.div
                    key={item.id}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      x: position.x - 12,
                      y: position.y - 12,
                    }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <motion.button
                      className="w-8 h-8 rounded-full bg-black/50 border border-blue-500/20 backdrop-blur-sm
                               flex items-center justify-center group relative"
                      whileHover={{
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                        borderColor: "rgba(59, 130, 246, 0.5)",
                      }}
                      onClick={() => setExpandedSection(item.id)}
                    >
                      <div className="text-blue-500/60 group-hover:text-blue-400 transition-colors">
                        {item.icon}
                      </div>
                      <span className="absolute -bottom-5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-blue-400/80">
                        {item.label}
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
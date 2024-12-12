import { useState } from "react";
import { motion } from "framer-motion";
import AIChat from "@/components/AIChat";
import {
  CreditCard,
  Wallet,
  Bell,
  Target,
  PiggyBank,
  FileText,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface OrbitalItem {
  id: string;
  icon: JSX.Element;
  label: string;
}

export default function Dashboard() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const orbitalItems: OrbitalItem[] = [
    { id: "wallet", icon: <Wallet size={24} />, label: "Finanzas" },
    { id: "credit", icon: <CreditCard size={24} />, label: "Crédito" },
    { id: "alerts", icon: <Bell size={24} />, label: "Alertas" },
    { id: "goals", icon: <Target size={24} />, label: "Metas" },
    { id: "savings", icon: <PiggyBank size={24} />, label: "Ahorros" },
    { id: "reports", icon: <FileText size={24} />, label: "Reportes" },
    { id: "security", icon: <AlertTriangle size={24} />, label: "Seguridad" },
    { id: "trends", icon: <TrendingUp size={24} />, label: "Tendencias" },
  ];

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center">
      {/* Contenedor principal del orbital */}
      <div className="relative w-[700px] h-[700px]">
        {/* Línea orbital */}
        <div className="absolute inset-0 rounded-full border border-blue-500/20" />
        
        {/* Elementos orbitales */}
        {orbitalItems.map((item, index) => {
          const angle = (index * 360) / orbitalItems.length;
          const radius = 300; // Radio del orbital
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <motion.button
              key={item.id}
              className="absolute w-12 h-12 -translate-x-6 -translate-y-6 rounded-full 
                        bg-black border border-blue-500/30 flex items-center justify-center
                        hover:border-blue-400/50 transition-colors"
              style={{
                left: `50%`,
                top: `50%`,
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedItem(item.id)}
            >
              <div className="text-blue-500/70 hover:text-blue-400">
                {item.icon}
              </div>
            </motion.button>
          );
        })}

        {/* Andy AI en el centro */}
        <motion.div
          className="absolute left-1/2 top-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2
                     rounded-full border border-blue-500/30 bg-black cursor-pointer
                     flex items-center justify-center overflow-hidden"
          onClick={() => setIsAIChatOpen(!isAIChatOpen)}
        >
          {isAIChatOpen ? (
            <AIChat className="w-full h-full p-4" />
          ) : (
            <img
              src="/Andy-icon white.png"
              alt="Andy AI"
              className="w-28 h-28 object-contain"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
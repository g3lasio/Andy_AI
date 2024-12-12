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
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const orbitalItems: OrbitalItem[] = [
    { id: "wallet", icon: <Wallet className="w-6 h-6" />, label: "Finanzas" },
    { id: "credit", icon: <CreditCard className="w-6 h-6" />, label: "Crédito" },
    { id: "alerts", icon: <Bell className="w-6 h-6" />, label: "Alertas" },
    { id: "goals", icon: <Target className="w-6 h-6" />, label: "Metas" },
    { id: "savings", icon: <PiggyBank className="w-6 h-6" />, label: "Ahorros" },
    { id: "reports", icon: <FileText className="w-6 h-6" />, label: "Reportes" },
    { id: "security", icon: <AlertTriangle className="w-6 h-6" />, label: "Seguridad" },
    { id: "trends", icon: <TrendingUp className="w-6 h-6" />, label: "Tendencias" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center overflow-hidden">
      <div className="relative w-[800px] h-[800px]">
        {/* Círculos orbitales con efecto de neón */}
        <div className="absolute inset-0 rounded-full border border-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]" />
        <div className="absolute inset-[60px] rounded-full border border-blue-500/8 shadow-[0_0_10px_rgba(59,130,246,0.08)]" />
        <div className="absolute inset-[120px] rounded-full border border-blue-500/6 shadow-[0_0_5px_rgba(59,130,246,0.06)]" />
        
        {/* Líneas de conexión con efecto de neón */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute left-1/2 top-1/2 h-[350px] w-[1px] bg-gradient-to-b from-blue-500/10 to-transparent origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${i * (360 / 12)}deg)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
        
        {/* Elementos orbitales */}
        {orbitalItems.map((item, index) => {
          const angle = (index * 360) / orbitalItems.length;
          const radius = 280;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <motion.div
              key={item.id}
              className="absolute w-14 h-14 -translate-x-7 -translate-y-7"
              style={{
                left: `50%`,
                top: `50%`,
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.button
                className={`w-full h-full rounded-full bg-black/80 backdrop-blur
                          border ${isHovered === item.id ? 'border-blue-400' : 'border-blue-500/30'}
                          flex items-center justify-center shadow-lg
                          transition-all duration-300 relative
                          hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]`}
                whileHover={{ scale: 1.15 }}
                onClick={() => setSelectedItem(item.id)}
                onHoverStart={() => setIsHovered(item.id)}
                onHoverEnd={() => setIsHovered(null)}
              >
                <div className={`${isHovered === item.id ? 'text-blue-300' : 'text-blue-400/80'} 
                               transition-colors duration-300`}>
                  {item.icon}
                </div>

                <motion.div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 
                            px-3 py-1 rounded-full bg-black/90 backdrop-blur-sm
                            border border-blue-500/20 text-blue-300 text-xs
                            whitespace-nowrap pointer-events-none"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ 
                    opacity: isHovered === item.id ? 1 : 0,
                    y: isHovered === item.id ? 0 : -5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.div>
              </motion.button>
            </motion.div>
          );
        })}

        {/* Andy AI en el centro */}
        <motion.div
          className="absolute left-1/2 top-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2
                     rounded-full cursor-pointer overflow-hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Círculo exterior con brillo */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 
                         shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-pulse" />
          
          {/* Contenedor principal */}
          <motion.div
            className="absolute inset-[2px] rounded-full bg-black/90 
                       flex items-center justify-center overflow-hidden
                       border-2 border-blue-500/20 backdrop-blur-sm"
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            whileHover={{ scale: 1.02 }}
          >
            {isAIChatOpen ? (
              <AIChat className="w-full h-full p-4" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center 
                            bg-gradient-to-b from-blue-950/20 to-transparent">
                <motion.img
                  src="/Andy-icon white.png"
                  alt="Andy AI"
                  className="w-24 h-24 object-contain"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                />
                <motion.span 
                  className="text-blue-400 mt-2 text-xs font-light"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Click para chatear
                </motion.span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

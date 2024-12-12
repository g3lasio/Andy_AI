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
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const menuItems: OrbitalItem[] = [
    { id: "wallet", icon: <Wallet className="w-5 h-5" />, label: "Finanzas" },
    { id: "credit", icon: <CreditCard className="w-5 h-5" />, label: "Crédito" },
    { id: "alerts", icon: <Bell className="w-5 h-5" />, label: "Alertas" },
    { id: "goals", icon: <Target className="w-5 h-5" />, label: "Metas" },
    { id: "savings", icon: <PiggyBank className="w-5 h-5" />, label: "Ahorros" },
    { id: "reports", icon: <FileText className="w-5 h-5" />, label: "Reportes" },
    { id: "security", icon: <AlertTriangle className="w-5 h-5" />, label: "Seguridad" },
    { id: "trends", icon: <TrendingUp className="w-5 h-5" />, label: "Tendencias" },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-black p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Andy AI Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <motion.div
            className="bg-slate-900/50 rounded-xl p-6 border border-blue-500/10 backdrop-blur-sm
                     hover:border-blue-500/20 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src="/Andy-icon white.png"
                alt="Andy AI"
                className="w-12 h-12 object-contain"
              />
              <h1 className="text-xl font-semibold text-slate-200">
                ¡Hola! Soy Andy, tu asistente financiero
              </h1>
            </div>

            {isAIChatOpen ? (
              <AIChat className="h-[400px]" />
            ) : (
              <motion.button
                className="w-full py-4 text-center text-slate-300 hover:text-blue-400
                         transition-colors duration-300"
                onClick={() => setIsAIChatOpen(true)}
                whileHover={{ scale: 1.01 }}
              >
                Click aquí para comenzar una conversación
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Menu Items Grid */}
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.button
              className={`w-full h-32 rounded-xl p-4
                       bg-slate-900/50 backdrop-blur-sm
                       border ${activeSection === item.id ? 'border-blue-500' : 'border-blue-500/10'}
                       hover:border-blue-500/30 transition-all duration-300
                       flex flex-col items-center justify-center gap-3`}
              onClick={() => setActiveSection(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`${activeSection === item.id ? 'text-blue-400' : 'text-slate-300'}`}>
                {item.icon}
              </div>
              <span className="text-sm text-slate-300">
                {item.label}
              </span>
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
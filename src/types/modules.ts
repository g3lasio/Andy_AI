
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'andy';
  timestamp: Date;
  module: ModuleType;
}

export type ModuleType = 
  | 'finAdvisor'
  | 'creditGuardian'
  | 'taxAdvisor'
  | 'familyFinance'
  | 'bizOptimizer';

import { useState, createContext, useContext, ReactNode, useEffect } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (value: boolean) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

const DEMO_MODE_KEY = 'growth_os_demo_mode';

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DEMO_MODE_KEY) === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(DEMO_MODE_KEY, String(isDemoMode));
  }, [isDemoMode]);

  const toggleDemoMode = () => setIsDemoMode(prev => !prev);
  const setDemoMode = (value: boolean) => setIsDemoMode(value);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, setDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

// Demo data for various modules
export const DEMO_DATA = {
  sites: [
    { id: 'demo-1', name: 'Demo Site', domain: 'demo.example.com', is_active: true },
    { id: 'demo-2', name: 'E-commerce Demo', domain: 'shop.example.com', is_active: true },
  ],
  kpis: {
    sessions: 12456,
    sessionsChange: 15.2,
    leads: 234,
    leadsChange: 8.7,
    revenue: 45600,
    revenueChange: 22.1,
    roas: 4.2,
    roasChange: 12.5,
  },
  agentRuns: [
    { id: 'run-1', agent_type: 'seo_auditor', status: 'completed', created_at: new Date().toISOString() },
    { id: 'run-2', agent_type: 'content_strategist', status: 'running', created_at: new Date().toISOString() },
    { id: 'run-3', agent_type: 'ads_optimizer', status: 'pending', created_at: new Date().toISOString() },
  ],
  approvals: [
    { id: 'app-1', action_type: 'publish_content', status: 'pending', risk_level: 'medium' },
    { id: 'app-2', action_type: 'update_ads', status: 'pending', risk_level: 'high' },
  ],
  aiCosts: {
    today: 12.45,
    thisWeek: 67.89,
    thisMonth: 234.56,
    breakdown: [
      { model: 'gemini-3-pro', requests: 145, tokens: 234000, cost: 12.34 },
      { model: 'gemini-3-flash', requests: 890, tokens: 1234000, cost: 45.67 },
    ],
  },
};

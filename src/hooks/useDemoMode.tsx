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

 // NOTE: Demo mode only shows visual indicators (banner, watermark).
 // No fake data is generated - components should show empty states
 // with a clear "Demo Mode" label when isDemoMode is true.
 // 
 // POLICY: "Zéro Fake Data" - Aucune donnée fictive en production.
 // Si aucune donnée réelle n'existe, afficher un empty state explicite.

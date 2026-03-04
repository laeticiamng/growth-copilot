import { useState, createContext, useContext, ReactNode, useEffect, useCallback } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (value: boolean) => void;
  activateDemo: () => void;
  deactivateDemo: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

const DEMO_MODE_KEY = 'growth_os_demo_mode';

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window !== 'undefined') {
      // Auto-activate if URL has /demo or ?demo=true
      const url = window.location;
      if (url.pathname === '/demo' || url.search.includes('demo=true')) {
        return true;
      }
      return localStorage.getItem(DEMO_MODE_KEY) === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(DEMO_MODE_KEY, String(isDemoMode));
  }, [isDemoMode]);

  const toggleDemoMode = () => setIsDemoMode(prev => !prev);
  const setDemoMode = (value: boolean) => setIsDemoMode(value);
  
  const activateDemo = useCallback(() => setIsDemoMode(true), []);
  const deactivateDemo = useCallback(() => {
    setIsDemoMode(false);
    localStorage.removeItem(DEMO_MODE_KEY);
  }, []);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, setDemoMode, activateDemo, deactivateDemo }}>
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

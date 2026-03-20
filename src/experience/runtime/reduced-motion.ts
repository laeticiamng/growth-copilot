import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getReducedMotionPreference() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getPowerSaverPreference() {
  if (typeof navigator === 'undefined') return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData ?? false;
}

export function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(getReducedMotionPreference);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);

    setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return reducedMotion;
}

export function usePowerSaverPreference() {
  const [powerSaver, setPowerSaver] = useState(getPowerSaverPreference);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const connection = (navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    }).connection;

    if (!connection?.addEventListener || !connection.removeEventListener) return;

    const onChange = () => setPowerSaver(connection.saveData ?? false);
    onChange();
    connection.addEventListener('change', onChange);
    return () => connection.removeEventListener('change', onChange);
  }, []);

  return powerSaver;
}

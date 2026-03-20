/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { detectExperienceCapabilities, type ExperienceCapabilities } from './capability-detection';
import { usePowerSaverPreference, useReducedMotionPreference } from './reduced-motion';
import {
  DEFAULT_EXPERIENCE_STATE,
  clampExperienceScene,
  deriveRouteExperience,
  type ExperienceMood,
  type ExperienceScene,
  type ExperienceState,
} from './experience-store';

interface ExperienceContextValue {
  state: ExperienceState;
  setPath: (path: string) => void;
  setPageExperience: (scene: Partial<ExperienceScene>) => void;
  clearPageExperience: () => void;
  setSoundEnabled: (enabled: boolean) => void;
}

const ExperienceContext = createContext<ExperienceContextValue | undefined>(undefined);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotionPreference();
  const powerSaver = usePowerSaverPreference();
  const [path, setPath] = useState(DEFAULT_EXPERIENCE_STATE.path);
  const [pageScene, setPageSceneState] = useState<Partial<ExperienceScene> | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [capabilities, setCapabilities] = useState<ExperienceCapabilities>(DEFAULT_EXPERIENCE_STATE.capabilities);

  useEffect(() => {
    setCapabilities(detectExperienceCapabilities());

    if (typeof window === 'undefined') return;
    const handleResize = () => setCapabilities(detectExperienceCapabilities());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setPageExperience = useCallback((scene: Partial<ExperienceScene>) => {
    setPageSceneState(scene);
  }, []);

  const clearPageExperience = useCallback(() => {
    setPageSceneState(null);
  }, []);

  const state = useMemo<ExperienceState>(() => {
    const routeScene = deriveRouteExperience(path);
    const mergedScene: ExperienceScene = {
      ...routeScene,
      ...pageScene,
      sceneId: pageScene?.sceneId || routeScene.sceneId,
      accent: pageScene?.accent || routeScene.accent || DEFAULT_EXPERIENCE_STATE.accent,
      mood: pageScene?.mood || routeScene.mood,
      intensity: pageScene?.intensity ?? routeScene.intensity,
      mode: pageScene?.mode || routeScene.mode,
    };

    const safeScene = clampExperienceScene(mergedScene, reducedMotion, powerSaver, capabilities);

    return {
      ...DEFAULT_EXPERIENCE_STATE,
      ...safeScene,
      path,
      soundEnabled,
      reducedMotion,
      powerSaver,
      capabilities,
    };
  }, [capabilities, pageScene, path, powerSaver, reducedMotion, soundEnabled]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.body.dataset.experienceMode = state.mode;
    document.body.dataset.experienceMood = state.mood;
    document.body.dataset.experienceIntensity = String(state.intensity);
    document.body.classList.toggle('experience-reduced-motion', state.reducedMotion);
    document.body.classList.toggle('experience-power-saver', state.powerSaver);
  }, [state.intensity, state.mode, state.mood, state.powerSaver, state.reducedMotion]);

  const value = useMemo(() => ({
    state,
    setPath,
    setPageExperience,
    clearPageExperience,
    setSoundEnabled,
  }), [clearPageExperience, setPageExperience, state]);

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
}

export function useExperienceScene(scene: Partial<ExperienceScene>) {
  const { clearPageExperience, setPageExperience } = useExperience();
  const { accent, intensity, mode, mood, sceneId } = scene;

  useEffect(() => {
    setPageExperience({ accent, intensity, mode, mood, sceneId });
    return () => clearPageExperience();
  }, [accent, clearPageExperience, intensity, mode, mood, sceneId, setPageExperience]);
}

export function useExperienceAccent(mood: ExperienceMood) {
  const moodMap: Record<ExperienceMood, string> = {
    calm: 'var(--experience-accent-premium)',
    focused: 'var(--experience-accent-primary)',
    anticipation: 'var(--experience-accent-success)',
    resolution: 'var(--experience-accent-premium)',
    alert: 'var(--experience-accent-cool)',
  };

  return moodMap[mood];
}

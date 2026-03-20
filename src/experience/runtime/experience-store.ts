import type { ExperienceCapabilities } from './capability-detection';

export type ExperienceMode = 'flat' | 'ambient' | 'immersive';
export type ExperienceMood = 'calm' | 'focused' | 'anticipation' | 'resolution' | 'alert';
export type ExperienceIntensity = 0 | 1 | 2 | 3;

export interface ExperienceScene {
  mode: ExperienceMode;
  intensity: ExperienceIntensity;
  mood: ExperienceMood;
  sceneId?: string;
  accent?: string;
}

export interface ExperienceState extends ExperienceScene {
  path: string;
  soundEnabled: boolean;
  reducedMotion: boolean;
  powerSaver: boolean;
  capabilities: ExperienceCapabilities;
}

export const DEFAULT_EXPERIENCE_STATE: ExperienceState = {
  path: '/',
  mode: 'ambient',
  intensity: 1,
  mood: 'calm',
  sceneId: 'default',
  accent: 'var(--experience-accent-primary)',
  soundEnabled: false,
  reducedMotion: false,
  powerSaver: false,
  capabilities: {
    webgl: false,
    webgpu: false,
    lowEndDevice: false,
    touchOnly: false,
  },
};

export function deriveRouteExperience(path: string): ExperienceScene {
  if (!path) return DEFAULT_EXPERIENCE_STATE;

  if (/^\/dashboard\/(audit-log|access-review|logs|status|settings|billing|ops)/.test(path)) {
    return { mode: 'flat', intensity: 0, mood: 'focused', sceneId: 'governance-flat', accent: 'var(--experience-accent-cool)' };
  }

  if (/^\/dashboard\/launch-os\/(new|project|decisions)/.test(path)) {
    return { mode: 'immersive', intensity: 3, mood: 'anticipation', sceneId: 'launch-signature', accent: 'var(--experience-accent-premium)' };
  }

  if (path.startsWith('/dashboard/launch-os')) {
    return { mode: 'ambient', intensity: 2, mood: 'focused', sceneId: 'launch-orbit', accent: 'var(--experience-accent-premium)' };
  }

  if (path === '/onboarding' || path === '/dashboard/setup' || path === '/dashboard/guide') {
    return { mode: 'immersive', intensity: 2, mood: 'anticipation', sceneId: 'activation-journey', accent: 'var(--experience-accent-success)' };
  }

  if (/^\/dashboard\/(agent|agents|research)/.test(path)) {
    return { mode: 'ambient', intensity: 2, mood: 'focused', sceneId: 'presence-layer', accent: 'var(--experience-accent-cool)' };
  }

  if (/^\/dashboard\/(integrations|sites|connections|brand-kit|services)/.test(path)) {
    return { mode: 'ambient', intensity: 1, mood: 'focused', sceneId: 'operations-layer', accent: 'var(--experience-accent-primary)' };
  }

  if (path === '/dashboard') {
    return { mode: 'ambient', intensity: 1, mood: 'focused', sceneId: 'cockpit-ambient', accent: 'var(--experience-accent-primary)' };
  }

  if (path === '/') {
    return { mode: 'ambient', intensity: 2, mood: 'calm', sceneId: 'landing-presence', accent: 'var(--experience-accent-premium)' };
  }

  if (/^\/(pricing|terms|privacy|legal|sales-terms|contact)/.test(path)) {
    return { mode: 'flat', intensity: 0, mood: 'focused', sceneId: 'rational-surface', accent: 'var(--experience-accent-cool)' };
  }

  if (path.startsWith('/dashboard')) {
    return { mode: 'ambient', intensity: 1, mood: 'focused', sceneId: 'dashboard-ambient', accent: 'var(--experience-accent-primary)' };
  }

  return { mode: 'ambient', intensity: 1, mood: 'calm', sceneId: 'public-ambient', accent: 'var(--experience-accent-premium)' };
}

export function clampExperienceScene(scene: ExperienceScene, reducedMotion: boolean, powerSaver: boolean, capabilities: ExperienceCapabilities): ExperienceScene {
  const forceLowerIntensity = reducedMotion || powerSaver || capabilities.lowEndDevice;
  const clampedIntensity = forceLowerIntensity ? Math.min(scene.intensity, reducedMotion ? 1 : 2) as ExperienceIntensity : scene.intensity;
  const clampedMode = reducedMotion || !capabilities.webgl
    ? scene.mode === 'immersive' ? 'ambient' : scene.mode
    : scene.mode;

  return {
    ...scene,
    mode: clampedIntensity === 0 ? 'flat' : clampedMode,
    intensity: clampedIntensity,
  };
}

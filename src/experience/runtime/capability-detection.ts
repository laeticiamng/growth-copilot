export interface ExperienceCapabilities {
  webgl: boolean;
  webgpu: boolean;
  lowEndDevice: boolean;
  touchOnly: boolean;
}

const FALLBACK_CAPABILITIES: ExperienceCapabilities = {
  webgl: false,
  webgpu: false,
  lowEndDevice: false,
  touchOnly: false,
};

function detectWebGLSupport() {
  if (typeof document === 'undefined') return false;

  const canvas = document.createElement('canvas');
  return Boolean(
    canvas.getContext('webgl') ||
    canvas.getContext('experimental-webgl')
  );
}

export function detectExperienceCapabilities(): ExperienceCapabilities {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return FALLBACK_CAPABILITIES;
  }

  const deviceMemory = 'deviceMemory' in navigator ? Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory) || 4 : 4;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const saveData = connection?.saveData ?? false;
  const effectiveType = connection?.effectiveType || '4g';
  const touchOnly = window.matchMedia('(pointer: coarse)').matches;
  const smallViewport = window.innerWidth < 768;
  const webgl = detectWebGLSupport();
  const webgpu = 'gpu' in navigator;
  const lowEndDevice = saveData || deviceMemory <= 4 || hardwareConcurrency <= 4 || effectiveType === '2g' || effectiveType === 'slow-2g' || (smallViewport && !webgl);

  return {
    webgl,
    webgpu,
    lowEndDevice,
    touchOnly,
  };
}

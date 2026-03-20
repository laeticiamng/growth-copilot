import { cn } from '@/lib/utils';
import { useExperience } from '@/experience/runtime/ExperienceProvider';

const moodClasses = {
  calm: 'ambient-layer--calm',
  focused: 'ambient-layer--focused',
  anticipation: 'ambient-layer--anticipation',
  resolution: 'ambient-layer--resolution',
  alert: 'ambient-layer--alert',
} as const;

export function AmbientLayer() {
  const { state } = useExperience();

  return (
    <div
      aria-hidden="true"
      className={cn(
        'ambient-layer',
        `ambient-layer--${state.mode}`,
        `ambient-layer--intensity-${state.intensity}`,
        moodClasses[state.mood],
      )}
      style={{ ['--experience-accent' as string]: state.accent || 'var(--experience-accent-primary)' }}
    >
      <div className="ambient-layer__base" />
      <div className="ambient-layer__grid" />
      <div className="ambient-layer__noise" />
      <div className="ambient-layer__orb ambient-layer__orb--primary" />
      <div className="ambient-layer__orb ambient-layer__orb--secondary" />
      {state.intensity >= 2 && <div className="ambient-layer__veil" />}
      <div key={`${state.path}-${state.sceneId}-${state.intensity}`} className="ambient-layer__transition" />
    </div>
  );
}

import type { Semaforo } from '@/types';

const colorMap: Record<Semaforo, { bg: string; label: string }> = {
  GREEN: { bg: 'bg-semaforo-verde', label: 'Todos los días' },
  YELLOW: { bg: 'bg-semaforo-amarillo', label: '3 veces/semana' },
  RED: { bg: 'bg-semaforo-rojo', label: '1 vez/semana' },
};

export function SemaforoBadge({ semaforo, showLabel = false }: { semaforo: Semaforo; showLabel?: boolean }) {
  const { bg, label } = colorMap[semaforo];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${bg}`} />
      {showLabel && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}

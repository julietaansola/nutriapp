import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/shared/MetricCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/lib/api';
import { mockMeasurements } from '@/lib/mockData';
import type { Measurement } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function ProgressPage() {
  const { user } = useAuthStore();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    if (!user?.patientId) { setMeasurements(mockMeasurements); return; }
    api.getMeasurements(user.patientId).then(setMeasurements).catch(() => setMeasurements(mockMeasurements));
  }, [user?.patientId]);

  if (measurements.length === 0) {
    return <EmptyState icon={Activity} title="Todavía no tenés mediciones cargadas" description="Cuando tu nutricionista cargue tu primera antropometría, vas a ver tu evolución acá." />;
  }

  const latest = measurements[measurements.length - 1];
  const prev = measurements.length > 1 ? measurements[measurements.length - 2] : null;

  const weightDiff = prev ? latest.weight - prev.weight : 0;
  const adiposeDiff = prev && latest.bodyComposition && prev.bodyComposition
    ? (latest.bodyComposition.adipose.kg ?? 0) - (prev.bodyComposition.adipose.kg ?? 0)
    : 0;
  const muscleDiff = prev && latest.bodyComposition && prev.bodyComposition
    ? (latest.bodyComposition.muscle.kg ?? 0) - (prev.bodyComposition.muscle.kg ?? 0)
    : 0;

  const chartData = measurements.map(m => ({
    date: format(new Date(m.measurementDate), 'MMM yy', { locale: es }),
    peso: m.weight,
    adiposa: m.bodyComposition?.adipose.kg,
    muscular: m.bodyComposition?.muscle.kg,
    pliegues: m.sumOf6Skinfolds,
    imo: m.muscleOseousIndex,
    cintura: m.perimeters?.minWaist,
    cadera: m.perimeters?.maxHips,
  }));

  const objectives = latest.objectives;
  const objectiveData = objectives ? [
    { name: 'Σ Pliegues', actual: latest.sumOf6Skinfolds ?? 0, objetivo: objectives.targetSkinfolds ?? 0 },
    { name: 'IMO', actual: latest.muscleOseousIndex ?? 0, objetivo: objectives.targetIMO ?? 0 },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi Progreso</h1>
        <p className="text-sm text-muted-foreground">
          {measurements.length} mediciones · Última: {format(new Date(latest.measurementDate), "d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Peso"
          value={latest.weight.toFixed(1)}
          unit="kg"
          trend={weightDiff < 0 ? 'down' : weightDiff > 0 ? 'up' : 'neutral'}
          trendValue={`${weightDiff > 0 ? '+' : ''}${weightDiff.toFixed(1)} kg`}
          trendPositive={false}
        />
        <MetricCard
          label="Masa Adiposa"
          value={`${latest.bodyComposition?.adipose.pct?.toFixed(1) ?? '-'}`}
          unit="%"
          trend={adiposeDiff < 0 ? 'down' : adiposeDiff > 0 ? 'up' : 'neutral'}
          trendValue={`${adiposeDiff > 0 ? '+' : ''}${adiposeDiff.toFixed(2)} kg`}
          trendPositive={false}
        />
        <MetricCard
          label="Masa Muscular"
          value={`${latest.bodyComposition?.muscle.pct?.toFixed(1) ?? '-'}`}
          unit="%"
          trend={muscleDiff > 0 ? 'up' : muscleDiff < 0 ? 'down' : 'neutral'}
          trendValue={`${muscleDiff > 0 ? '+' : ''}${muscleDiff.toFixed(2)} kg`}
          trendPositive={true}
        />
        <MetricCard
          label="IMO"
          value={`${latest.muscleOseousIndex?.toFixed(2) ?? '-'}`}
          trend="neutral"
        />
      </div>

      {/* Weight chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Evolución del peso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="peso" stroke="#3D5A4C" strokeWidth={2.5} dot={{ fill: '#3D5A4C', r: 4 }} name="Peso (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Adipose & Muscle chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Masa Adiposa vs Muscular</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="adiposa" stroke="#F4C95D" strokeWidth={2.5} dot={{ fill: '#F4C95D', r: 4 }} name="Adiposa (kg)" />
                <Line type="monotone" dataKey="muscular" stroke="#8FB09A" strokeWidth={2.5} dot={{ fill: '#8FB09A', r: 4 }} name="Muscular (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Skinfolds chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Suma de 6 pliegues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="pliegues" stroke="#3D5A4C" strokeWidth={2.5} dot={{ fill: '#3D5A4C', r: 4 }} name="Σ6 pliegues (mm)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Objectives comparison */}
      {objectiveData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Actual vs Objetivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={objectiveData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="actual" fill="#8FB09A" name="Actual" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="objetivo" fill="#F4C95D" name="Objetivo" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {objectives && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-voit-light">
                  <p className="text-muted-foreground text-xs">Déficit adiposo</p>
                  <p className="font-semibold">{objectives.adiposeDeficitKg} kg en ~{objectives.deficitMonths} meses</p>
                </div>
                <div className="p-3 rounded-lg bg-voit-light">
                  <p className="text-muted-foreground text-xs">Ganancia muscular</p>
                  <p className="font-semibold">{objectives.muscleGainKg} kg en ~{objectives.surplusMonths} meses</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metabolism info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Metabolismo y Gasto Energético</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-voit-forest">{latest.basalMetabolism?.toFixed(0) ?? '-'}</p>
              <p className="text-xs text-muted-foreground">MB (kcal)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-voit-mustard">x1.5</p>
              <p className="text-xs text-muted-foreground">{latest.physicalActivityLevel ?? '-'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-voit-forest">{latest.totalEnergyExpenditure?.toFixed(0) ?? '-'}</p>
              <p className="text-xs text-muted-foreground">GET (kcal)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

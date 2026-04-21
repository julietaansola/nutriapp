import { useState, useEffect } from 'react';
import { Users, Activity, CalendarClock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as api from '@/lib/api';
import { mockStats } from '@/lib/mockData';
import type { DashboardStats } from '@/types';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(() => setStats(mockStats));
  }, []);

  const cards = [
    { label: 'Pacientes activos', value: stats.totalPatients, icon: Users, color: 'text-voit-forest' },
    { label: 'Mediciones este mes', value: stats.measurementsThisMonth, icon: Activity, color: 'text-voit-mint' },
    { label: 'Próximos turnos', value: stats.upcomingAppointments, icon: CalendarClock, color: 'text-voit-mustard' },
    { label: 'Planes este mes', value: stats.plansThisMonth, icon: FileText, color: 'text-voit-forest' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen de tu consultorio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{label}</p>
                  <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-voit-light ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { text: 'Nueva medición cargada para Julieta Ansola', time: 'Hace 2 días' },
              { text: 'Plan alimentario actualizado para Julieta Ansola', time: 'Hace 2 días' },
              { text: 'Turno agendado: Julieta Ansola - 15/05/2026', time: 'Hace 1 semana' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <p className="text-sm">{item.text}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

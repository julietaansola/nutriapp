import { useState, useEffect } from 'react';
import { CalendarClock, Clock, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/lib/api';
import { mockAppointment } from '@/lib/mockData';
import type { Appointment } from '@/types';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';

export function AppointmentPage() {
  const { user } = useAuthStore();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.patientId) { setAppointment(mockAppointment); setNotes(mockAppointment.patientNotes || ''); return; }
    api.getNextAppointment(user.patientId)
      .then(a => { if (a) { setAppointment(a); setNotes(a.patientNotes || ''); } else { setAppointment(mockAppointment); setNotes(mockAppointment.patientNotes || ''); } })
      .catch(() => { setAppointment(mockAppointment); setNotes(mockAppointment.patientNotes || ''); });
  }, [user?.patientId]);

  const handleSaveNotes = async () => {
    if (!appointment) return;
    setSaving(true);
    try {
      await api.updateAppointment(appointment.id, { patientNotes: notes });
    } catch {}
    setSaving(false);
  };

  if (!appointment) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Próxima Consulta</h1>
        <EmptyState icon={CalendarClock} title="No tenés turnos agendados" description="Cuando tu nutricionista agende tu próximo turno, lo vas a ver acá." />
      </div>
    );
  }

  const apptDate = new Date(appointment.scheduledDate);
  const now = new Date();
  const daysUntil = differenceInDays(apptDate, now);
  const hoursUntil = differenceInHours(apptDate, now);

  let countdown = '';
  if (daysUntil > 1) countdown = `Faltan ${daysUntil} días`;
  else if (daysUntil === 1) countdown = 'Falta 1 día';
  else if (hoursUntil > 0) countdown = `Faltan ${hoursUntil} horas`;
  else countdown = '¡Es hoy!';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Próxima Consulta</h1>
      </div>

      <Card className="border-voit-mint/30">
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-voit-mint/10 mb-4">
            <CalendarClock className="h-8 w-8 text-voit-forest" />
          </div>
          <p className="text-3xl font-bold text-voit-forest">{countdown}</p>
          <p className="text-lg mt-2">
            {format(apptDate, "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(apptDate, 'HH:mm')} hs</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Dudas para la consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anotá acá tus dudas o lo que quieras consultarle a tu nutri..."
            className="min-h-[150px]"
          />
          <Button onClick={handleSaveNotes} disabled={saving} variant="outline" className="w-full sm:w-auto">
            {saving ? 'Guardando...' : 'Guardar notas'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

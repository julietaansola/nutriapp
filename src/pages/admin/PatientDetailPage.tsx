import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Activity, UtensilsCrossed, StickyNote, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PdfUploader } from '@/components/shared/PdfUploader';
import { EmptyState } from '@/components/shared/EmptyState';
import * as api from '@/lib/api';
import { mockPatient } from '@/lib/mockData';
import type { Patient } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState('');
  const [notesTimeout, setNotesTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getPatient(id).then(p => { setPatient(p); setNotes(p.notes || ''); }).catch(() => { setPatient(mockPatient); setNotes(mockPatient.notes || ''); });
  }, [id]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (notesTimeout) clearTimeout(notesTimeout);
    const t = setTimeout(() => {
      if (id) api.updatePatientNotes(id, value).catch(() => {});
    }, 1000);
    setNotesTimeout(t);
  };

  const handleUploadMeasurement = async (file: File) => {
    if (!id) return;
    try {
      const result = await api.uploadMeasurementPdf(id, file);
      console.log('Parsed measurement:', result);
      // In production, show a dialog with parsed data for confirmation
      alert('PDF procesado. Los datos fueron extraídos correctamente.');
    } catch {
      alert('Error al procesar el PDF');
    }
  };

  const handleUploadPlan = async (file: File) => {
    if (!id) return;
    try {
      const result = await api.uploadPlanPdf(id, file);
      console.log('Parsed plan:', result);
      alert('PDF del plan procesado correctamente.');
    } catch {
      alert('Error al procesar el PDF');
    }
  };

  if (!patient) return <div className="text-center py-16 text-muted-foreground">Cargando...</div>;

  const lastMeasurement = patient.measurements?.[0];
  const activePlan = patient.mealPlans?.find(p => p.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-voit-light flex items-center justify-center">
          <span className="text-lg font-bold text-voit-forest">{patient.firstName[0]}{patient.lastName[0]}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{patient.firstName} {patient.lastName}</h1>
          <p className="text-sm text-muted-foreground">{patient.email}</p>
        </div>
      </div>

      <Tabs defaultValue="datos">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="datos" className="gap-1.5"><User className="h-3.5 w-3.5" />Datos</TabsTrigger>
          <TabsTrigger value="mediciones" className="gap-1.5"><Activity className="h-3.5 w-3.5" />Mediciones</TabsTrigger>
          <TabsTrigger value="planes" className="gap-1.5"><UtensilsCrossed className="h-3.5 w-3.5" />Planes</TabsTrigger>
          <TabsTrigger value="notas" className="gap-1.5"><StickyNote className="h-3.5 w-3.5" />Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="mt-4">
          <Card>
            <CardContent className="p-6 grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">Nombre completo</p><p className="font-medium">{patient.firstName} {patient.lastName}</p></div>
              <div><p className="text-xs text-muted-foreground">Fecha de nacimiento</p><p className="font-medium">{patient.birthDate ? format(new Date(patient.birthDate), 'dd/MM/yyyy') : '-'}</p></div>
              <div><p className="text-xs text-muted-foreground">Teléfono</p><p className="font-medium">{patient.phone || '-'}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{patient.email || '-'}</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mediciones" className="mt-4 space-y-4">
          <PdfUploader onUpload={handleUploadMeasurement} label="Subir informe de composición corporal" />

          {!patient.measurements?.length ? (
            <EmptyState icon={Activity} title="Sin mediciones" description="Todavía no hay mediciones cargadas para este paciente." />
          ) : (
            <div className="space-y-3">
              {patient.measurements.map(m => (
                <Card key={m.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Medición #{m.measurementNumber}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(m.measurementDate), "d 'de' MMMM yyyy", { locale: es })}
                        </span>
                      </div>
                      {m.pdfUrl && (
                        <a href={m.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-voit-forest hover:underline">
                          Descargar PDF
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Peso:</span> <span className="font-medium">{m.weight} kg</span></div>
                      <div><span className="text-muted-foreground">M. Adiposa:</span> <span className="font-medium">{m.bodyComposition?.adipose.kg} kg ({m.bodyComposition?.adipose.pct}%)</span></div>
                      <div><span className="text-muted-foreground">M. Muscular:</span> <span className="font-medium">{m.bodyComposition?.muscle.kg} kg ({m.bodyComposition?.muscle.pct}%)</span></div>
                      <div><span className="text-muted-foreground">Σ6 pliegues:</span> <span className="font-medium">{m.sumOf6Skinfolds} mm</span></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="planes" className="mt-4 space-y-4">
          <PdfUploader onUpload={handleUploadPlan} label="Subir plan de alimentación" />

          {!patient.mealPlans?.length ? (
            <EmptyState icon={UtensilsCrossed} title="Sin planes" description="Todavía no hay planes de alimentación cargados." />
          ) : (
            <div className="space-y-3">
              {patient.mealPlans.map(plan => (
                <Card key={plan.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{plan.objective}</p>
                          {plan.isActive && <Badge className="bg-voit-mint/20 text-voit-forest text-xs">Activo</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {format(new Date(plan.planDate), "d 'de' MMMM yyyy", { locale: es })}
                        </p>
                      </div>
                      {plan.pdfUrl && (
                        <a href={plan.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-voit-forest hover:underline">
                          Descargar PDF
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Notas privadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={e => handleNotesChange(e.target.value)}
                placeholder="Escribí notas privadas sobre este paciente..."
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-2">Las notas se guardan automáticamente.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

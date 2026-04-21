import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Activity, UtensilsCrossed, StickyNote, CheckCircle, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  // Parsed data preview states
  const [parsedMeasurement, setParsedMeasurement] = useState<any>(null);
  const [parsedPlan, setParsedPlan] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const loadPatient = () => {
    if (!id) return;
    api.getPatient(id).then(p => { setPatient(p); setNotes(p.notes || ''); }).catch(() => { setPatient(mockPatient); setNotes(mockPatient.notes || ''); });
  };

  useEffect(() => { loadPatient(); }, [id]);

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
      setParsedMeasurement({ ...result.parsed, pdfUrl: result.pdfUrl });
    } catch {
      alert('Error al procesar el PDF. Podés cargar los datos manualmente.');
      setParsedMeasurement({
        measurementNumber: (patient?.measurements?.length || 0) + 1,
        measurementDate: new Date().toISOString().split('T')[0],
        weight: 0, height: patient?.measurements?.[0]?.height || 0,
      });
    }
  };

  const handleSaveMeasurement = async () => {
    if (!id || !parsedMeasurement) return;
    setSaving(true);
    try {
      await api.createMeasurement(id, parsedMeasurement);
      setParsedMeasurement(null);
      loadPatient();
    } catch {
      alert('Error al guardar la medición');
    }
    setSaving(false);
  };

  const handleUploadPlan = async (file: File) => {
    if (!id) return;
    try {
      const result = await api.uploadPlanPdf(id, file);
      setParsedPlan({ ...result.parsed, pdfUrl: result.pdfUrl });
    } catch {
      alert('Error al procesar el PDF del plan.');
    }
  };

  const handleSavePlan = async () => {
    if (!id || !parsedPlan) return;
    setSaving(true);
    try {
      await api.createMealPlan(id, {
        planDate: new Date().toISOString(),
        objective: parsedPlan.objective,
        prescriptions: parsedPlan.prescriptions,
        suggestions: parsedPlan.suggestions,
        flexFreeMeals: parsedPlan.flexFreeMeals,
        totalWeeklyMeals: parsedPlan.totalWeeklyMeals,
        pdfUrl: parsedPlan.pdfUrl,
        rawPdfText: parsedPlan.rawPdfText,
        exchanges: parsedPlan.exchanges,
      });
      setParsedPlan(null);
      loadPatient();
    } catch {
      alert('Error al guardar el plan');
    }
    setSaving(false);
  };

  const updateParsedField = (field: string, value: any) => {
    setParsedMeasurement((prev: any) => ({ ...prev, [field]: value }));
  };

  if (!patient) return <div className="text-center py-16 text-muted-foreground">Cargando...</div>;

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

          {/* Preview de datos parseados */}
          {parsedMeasurement && (
            <Card className="border-voit-mustard/50 bg-voit-mustard/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-voit-mustard" />
                  Datos extraídos del PDF — Revisá y confirmá
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Nº de medición</Label>
                    <Input type="number" value={parsedMeasurement.measurementNumber || ''} onChange={e => updateParsedField('measurementNumber', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-xs">Fecha</Label>
                    <Input type="date" value={parsedMeasurement.measurementDate || ''} onChange={e => updateParsedField('measurementDate', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Peso (kg)</Label>
                    <Input type="number" step="0.1" value={parsedMeasurement.weight || ''} onChange={e => updateParsedField('weight', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-xs">Talla (cm)</Label>
                    <Input type="number" step="0.1" value={parsedMeasurement.height || ''} onChange={e => updateParsedField('height', parseFloat(e.target.value))} />
                  </div>
                </div>

                {parsedMeasurement.bodyComposition && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Composición corporal</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {Object.entries(parsedMeasurement.bodyComposition as Record<string, {kg: number | null; pct: number | null}>).map(([key, val]) => (
                        <div key={key} className="bg-background rounded-lg p-2">
                          <p className="text-xs text-muted-foreground capitalize">{key === 'adipose' ? 'Adiposa' : key === 'muscle' ? 'Muscular' : key === 'residual' ? 'Residual' : key === 'bone' ? 'Ósea' : 'Piel'}</p>
                          <p className="text-sm font-medium">{val.kg ?? '-'} kg ({val.pct ?? '-'}%)</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Σ6 pliegues (mm)</Label>
                    <Input type="number" step="0.1" value={parsedMeasurement.sumOf6Skinfolds || ''} onChange={e => updateParsedField('sumOf6Skinfolds', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-xs">IMO</Label>
                    <Input type="number" step="0.01" value={parsedMeasurement.muscleOseousIndex || ''} onChange={e => updateParsedField('muscleOseousIndex', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-xs">Metabolismo basal</Label>
                    <Input type="number" step="0.1" value={parsedMeasurement.basalMetabolism || ''} onChange={e => updateParsedField('basalMetabolism', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-xs">GET (kcal)</Label>
                    <Input type="number" step="0.1" value={parsedMeasurement.totalEnergyExpenditure || ''} onChange={e => updateParsedField('totalEnergyExpenditure', parseFloat(e.target.value))} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveMeasurement} disabled={saving} className="bg-voit-forest hover:bg-voit-forest/90 gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    {saving ? 'Guardando...' : 'Confirmar y guardar'}
                  </Button>
                  <Button variant="outline" onClick={() => setParsedMeasurement(null)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview de plan parseado */}
          {parsedPlan && (
            <Card className="border-voit-mustard/50 bg-voit-mustard/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-voit-mustard" />
                  Plan extraído — Revisá y confirmá
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm"><span className="text-muted-foreground">Objetivo:</span> <span className="font-medium">{parsedPlan.objective}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Prescripciones:</span> {parsedPlan.prescriptions?.length || 0} momentos</p>
                <p className="text-sm"><span className="text-muted-foreground">Intercambios:</span> {parsedPlan.exchanges?.length || 0} alimentos</p>
                <div className="flex gap-2">
                  <Button onClick={handleSavePlan} disabled={saving} className="bg-voit-forest hover:bg-voit-forest/90 gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    {saving ? 'Guardando...' : 'Confirmar y guardar'}
                  </Button>
                  <Button variant="outline" onClick={() => setParsedPlan(null)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

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

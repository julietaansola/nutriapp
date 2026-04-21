import { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/lib/api';
import { mockPatient } from '@/lib/mockData';
import type { Patient } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PdfItem {
  id: string;
  type: 'antropometria' | 'plan';
  date: string;
  label: string;
  pdfUrl: string | null;
}

export function DownloadsPage() {
  const { user } = useAuthStore();
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      let patient: Patient | null = null;
      try {
        if (user?.patientId) patient = await api.getPatient(user.patientId);
      } catch {
        patient = mockPatient;
      }
      if (!patient) { patient = mockPatient; }

      const items: PdfItem[] = [];
      patient.measurements?.forEach(m => {
        items.push({
          id: m.id,
          type: 'antropometria',
          date: m.measurementDate,
          label: `Antropometría #${m.measurementNumber}`,
          pdfUrl: m.pdfUrl,
        });
      });
      patient.mealPlans?.forEach(p => {
        items.push({
          id: p.id,
          type: 'plan',
          date: p.planDate,
          label: `Plan: ${p.objective}`,
          pdfUrl: p.pdfUrl,
        });
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPdfs(items);
    };
    loadData();
  }, [user?.patientId]);

  if (pdfs.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Descargas</h1>
        <EmptyState icon={Download} title="No hay PDFs disponibles" description="Cuando tu nutricionista cargue informes, van a aparecer acá para descargar." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Descargas</h1>
        <p className="text-sm text-muted-foreground">{pdfs.length} documentos disponibles</p>
      </div>

      <div className="space-y-3">
        {pdfs.map(pdf => (
          <Card key={pdf.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-2 rounded-lg ${pdf.type === 'antropometria' ? 'bg-voit-mint/10' : 'bg-voit-mustard/10'}`}>
                <FileText className={`h-5 w-5 ${pdf.type === 'antropometria' ? 'text-voit-forest' : 'text-voit-mustard'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{pdf.label}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(pdf.date), "d 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {pdf.type === 'antropometria' ? 'Antropometría' : 'Plan'}
              </Badge>
              {pdf.pdfUrl ? (
                <a href={pdf.pdfUrl} target="_blank" rel="noreferrer" className="text-voit-forest hover:underline">
                  <Download className="h-4 w-4" />
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">Sin PDF</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

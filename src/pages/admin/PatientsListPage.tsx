import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/EmptyState';
import * as api from '@/lib/api';
import { mockPatient } from '@/lib/mockData';
import type { Patient } from '@/types';

export function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([mockPatient]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getPatients(search).then(setPatients).catch(() => setPatients([mockPatient]));
  }, [search]);

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-sm text-muted-foreground">{patients.length} pacientes registrados</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No se encontraron pacientes"
          description="Probá con otro término de búsqueda."
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map(p => (
            <Card
              key={p.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/admin/pacientes/${p.id}`)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10 bg-voit-light">
                  <AvatarFallback className="bg-voit-light text-voit-forest text-sm font-semibold">
                    {p.firstName[0]}{p.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{p.firstName} {p.lastName}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {p.measurements && p.measurements.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {p.measurements.length} mediciones
                    </Badge>
                  )}
                  {p.mealPlans && p.mealPlans.some(mp => mp.isActive) && (
                    <Badge className="bg-voit-mint/20 text-voit-forest text-xs">
                      Plan activo
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

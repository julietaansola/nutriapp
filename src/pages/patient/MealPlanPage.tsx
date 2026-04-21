import { useState, useEffect } from 'react';
import { UtensilsCrossed, Sunrise, Sun, Moon, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SemaforoBadge } from '@/components/shared/SemaforoBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/lib/api';
import { mockMealPlan, mockExchanges } from '@/lib/mockData';
import type { MealPlan, Exchange, Semaforo } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const categoryLabels: Record<string, string> = {
  cereal: 'Cereales',
  fruta: 'Frutas',
  proteina_manana: 'Proteínas (Mañana/Tarde)',
  proteina_almuerzo: 'Proteínas (Almuerzo/Cena)',
  hidrato: 'Hidratos de Carbono',
  verdura: 'Verduras',
  grasa: 'Grasas',
  practico: 'Alimentos Prácticos',
};

const momentIcons: Record<string, React.ReactNode> = {
  'Mañana/Tarde': <Sunrise className="h-4 w-4" />,
  'Mediodía': <Sun className="h-4 w-4" />,
  'Noche': <Moon className="h-4 w-4" />,
};

export function MealPlanPage() {
  const { user } = useAuthStore();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [semaforoFilter, setSemaforoFilter] = useState<Semaforo | 'ALL'>('ALL');
  const [activeCategory, setActiveCategory] = useState('cereal');

  useEffect(() => {
    if (!user?.patientId) { setPlan(mockMealPlan); setExchanges(mockExchanges); return; }
    api.getActiveMealPlan(user.patientId)
      .then(p => { setPlan(p); setExchanges(p.exchanges || []); })
      .catch(() => { setPlan(mockMealPlan); setExchanges(mockExchanges); });
  }, [user?.patientId]);

  if (!plan) {
    return <EmptyState icon={UtensilsCrossed} title="No tenés un plan activo" description="Cuando tu nutricionista cargue tu plan, lo vas a ver acá." />;
  }

  const categories = [...new Set(exchanges.map(e => e.category))];
  const filteredExchanges = exchanges
    .filter(e => e.category === activeCategory)
    .filter(e => semaforoFilter === 'ALL' || e.semaforo === semaforoFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi Plan</h1>
        <p className="text-sm text-muted-foreground">
          {plan.objective} · {format(new Date(plan.planDate), "MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* Prescriptions by moment */}
      <div className="space-y-3">
        {plan.prescriptions.map((p) => (
          <Card key={p.moment}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {momentIcons[p.moment] || <Sun className="h-4 w-4" />}
                {p.moment}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1">
                {p.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-voit-mint mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              {p.examples.length > 0 && (
                <div className="bg-voit-light dark:bg-muted rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Ejemplos</p>
                  {p.examples.map((ex, i) => (
                    <p key={i} className="text-sm text-foreground/80">{ex}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exchange tables */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Sistema de Intercambios</h2>

        {/* Semaforo filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['ALL', 'GREEN', 'YELLOW', 'RED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSemaforoFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                semaforoFilter === s
                  ? 'bg-voit-forest text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {s === 'ALL' ? 'Todos' : s === 'GREEN' ? '🟢 Todos los días' : s === 'YELLOW' ? '🟡 3 veces/sem' : '🔴 1 vez/sem'}
            </button>
          ))}
        </div>

        {/* Category tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="text-xs whitespace-nowrap">
                {categoryLabels[cat] || cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat} value={cat} className="mt-3">
              {filteredExchanges.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No hay alimentos con ese filtro.</p>
              ) : (
                <div className="space-y-2">
                  {filteredExchanges.map(ex => (
                    <div key={ex.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 border border-border">
                      <SemaforoBadge semaforo={ex.semaforo} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">{ex.portion}{ex.grams ? ` · ${ex.grams}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Flexibility card */}
      <Card className="border-voit-mustard/30 bg-voit-mustard/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-voit-mustard shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Flexibilidad nutricional</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tenés <span className="font-semibold text-foreground">{plan.totalWeeklyMeals}</span> comidas a la semana.
              Te sugiero hacer al menos <span className="font-semibold text-foreground">{plan.totalWeeklyMeals - plan.flexFreeMeals}</span> bien
              y que puedas elegir <span className="font-semibold text-voit-mustard">{plan.flexFreeMeals} comidas libres</span>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      {plan.suggestions && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sugerencias de tu nutri</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{plan.suggestions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

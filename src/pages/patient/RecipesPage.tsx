import { useState, useEffect } from 'react';
import { Lightbulb, Heart, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/lib/api';
import { mockRecipes } from '@/lib/mockData';
import type { Recipe, FavoriteRecipe } from '@/types';

const moments = [
  { value: 'mañana', label: 'Mañana/Tarde' },
  { value: 'mediodía', label: 'Mediodía' },
  { value: 'noche', label: 'Noche' },
];

export function RecipesPage() {
  const { user } = useAuthStore();
  const [selectedMoment, setSelectedMoment] = useState('mediodía');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('generar');

  useEffect(() => {
    if (!user?.patientId) return;
    api.getFavorites(user.patientId).then(setFavorites).catch(() => {});
  }, [user?.patientId]);

  const handleGenerate = async () => {
    if (!user?.patientId) { setRecipes(mockRecipes); return; }
    setLoading(true);
    try {
      const res = await api.generateRecipes(user.patientId, selectedMoment);
      setRecipes(res);
    } catch {
      setRecipes(mockRecipes);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (recipe: Recipe) => {
    if (!user?.patientId) return;
    const existing = favorites.find(f => f.title === recipe.title);
    if (existing) {
      await api.removeFavorite(existing.id).catch(() => {});
      setFavorites(prev => prev.filter(f => f.id !== existing.id));
    } else {
      try {
        const fav = await api.addFavorite({ patientId: user.patientId, ...recipe });
        setFavorites(prev => [fav, ...prev]);
      } catch {}
    }
  };

  const isFavorite = (title: string) => favorites.some(f => f.title === title);

  const filteredFavorites = favorites.filter(f =>
    f.title.toLowerCase().includes(search.toLowerCase()) ||
    f.ingredients.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ideas de Platos</h1>
        <p className="text-sm text-muted-foreground">Recetas que respetan tu plan de alimentación</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="generar" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" />Generar ideas</TabsTrigger>
          <TabsTrigger value="favoritos" className="gap-1.5"><Heart className="h-3.5 w-3.5" />Mis favoritos ({favorites.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="generar" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-1">
              {moments.map(m => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMoment(m.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMoment === m.value
                      ? 'bg-voit-forest text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="bg-voit-forest hover:bg-voit-forest/90 gap-1.5">
              <Sparkles className="h-4 w-4" />
              {loading ? 'Generando...' : 'Generar ideas'}
            </Button>
          </div>

          {recipes.length === 0 ? (
            <EmptyState icon={Lightbulb} title="Generá ideas de platos" description="Elegí un momento del día y hacé click en 'Generar ideas' para recibir 5 recetas basadas en tu plan." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((r, i) => (
                <Card key={i} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base pr-8">{r.title}</CardTitle>
                      <button
                        onClick={() => handleFavorite(r)}
                        className="absolute top-4 right-4"
                      >
                        <Heart className={`h-5 w-5 transition-colors ${isFavorite(r.title) ? 'fill-semaforo-rojo text-semaforo-rojo' : 'text-muted-foreground hover:text-semaforo-rojo'}`} />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Ingredientes</p>
                      <p className="text-sm whitespace-pre-line mt-1">{r.ingredients}</p>
                    </div>
                    {r.instructions && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Preparación</p>
                        <p className="text-sm mt-1">{r.instructions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favoritos" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar en favoritos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          {filteredFavorites.length === 0 ? (
            <EmptyState icon={Heart} title="No tenés favoritos" description="Guardá tus recetas favoritas tocando el corazón." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFavorites.map(r => (
                <Card key={r.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{r.title}</CardTitle>
                      <button onClick={() => handleFavorite(r)}>
                        <Heart className="h-5 w-5 fill-semaforo-rojo text-semaforo-rojo" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-line">{r.ingredients}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

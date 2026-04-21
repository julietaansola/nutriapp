import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { generateRecipeIdeas } from '../services/recipeGenerator';

const router = Router();
const prisma = new PrismaClient();

router.post('/generate', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, mealMoment } = req.body;
    const plan = await prisma.mealPlan.findFirst({
      where: { patientId: patientId as string, isActive: true },
      include: { exchanges: true },
    });
    if (!plan) { res.status(404).json({ error: 'No hay plan activo' }); return; }
    const recipes = await generateRecipeIdeas(plan, mealMoment);
    res.json(recipes);
  } catch (err) {
    console.error('Error generating recipes:', err);
    res.status(500).json({ error: 'Error al generar ideas de platos' });
  }
});

router.get('/favorites/:patientId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;
    const favorites = await prisma.favoriteRecipe.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites);
  } catch {
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

router.post('/favorites', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const recipe = await prisma.favoriteRecipe.create({
      data: {
        patientId: req.body.patientId as string,
        title: req.body.title,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        mealMoment: req.body.mealMoment,
      },
    });
    res.status(201).json(recipe);
  } catch {
    res.status(500).json({ error: 'Error al guardar favorito' });
  }
});

router.delete('/favorites/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.favoriteRecipe.delete({ where: { id } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
});

export default router;

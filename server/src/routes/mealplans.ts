import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth';
import { parsePlanAlimentarioPdf } from '../services/pdfParser';

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../../uploads/plans');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage, fileFilter: (_req, file, cb) => cb(null, file.mimetype === 'application/pdf') });

router.get('/patient/:patientId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;
    const plans = await prisma.mealPlan.findMany({
      where: { patientId },
      include: { exchanges: true },
      orderBy: { planDate: 'desc' },
    });
    res.json(plans);
  } catch {
    res.status(500).json({ error: 'Error al obtener planes' });
  }
});

router.get('/active/:patientId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;
    const plan = await prisma.mealPlan.findFirst({
      where: { patientId, isActive: true },
      include: { exchanges: true },
      orderBy: { planDate: 'desc' },
    });
    if (!plan) { res.status(404).json({ error: 'No hay plan activo' }); return; }
    res.json(plan);
  } catch {
    res.status(500).json({ error: 'Error' });
  }
});

router.post('/upload/:patientId', authenticate, upload.single('pdf'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No se recibió archivo PDF' }); return; }
    const parsed = await parsePlanAlimentarioPdf(req.file.path);
    const pdfUrl = `/uploads/plans/${req.file.filename}`;
    res.json({ parsed, pdfUrl, filename: req.file.originalname });
  } catch (err) {
    console.error('Error parsing plan PDF:', err);
    res.status(500).json({ error: 'Error al procesar el PDF' });
  }
});

router.post('/:patientId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;
    const { exchanges, ...planData } = req.body;

    await prisma.mealPlan.updateMany({
      where: { patientId, isActive: true },
      data: { isActive: false },
    });

    const plan = await prisma.mealPlan.create({
      data: {
        patientId,
        planDate: new Date(planData.planDate),
        objective: planData.objective as string,
        prescriptions: planData.prescriptions,
        suggestions: planData.suggestions,
        flexFreeMeals: planData.flexFreeMeals || 4,
        totalWeeklyMeals: planData.totalWeeklyMeals || 28,
        pdfUrl: planData.pdfUrl,
        rawPdfText: planData.rawPdfText,
        isActive: true,
        exchanges: exchanges?.length
          ? {
              createMany: {
                data: exchanges.map((ex: { category: string; name: string; portion: string; grams?: string; semaforo?: string }) => ({
                  category: ex.category,
                  name: ex.name,
                  portion: ex.portion,
                  grams: ex.grams,
                  semaforo: ex.semaforo || 'GREEN',
                })),
              },
            }
          : undefined,
      },
      include: { exchanges: true },
    });
    res.status(201).json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear plan' });
  }
});

export default router;

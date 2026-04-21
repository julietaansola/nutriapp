import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth';
import { parseAntropometriaPdf } from '../services/pdfParser';

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../../uploads/measurements');
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
    const measurements = await prisma.measurement.findMany({
      where: { patientId },
      orderBy: { measurementDate: 'asc' },
    });
    res.json(measurements);
  } catch {
    res.status(500).json({ error: 'Error al obtener mediciones' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const m = await prisma.measurement.findUnique({ where: { id } });
    if (!m) { res.status(404).json({ error: 'No encontrada' }); return; }
    res.json(m);
  } catch {
    res.status(500).json({ error: 'Error' });
  }
});

router.post('/upload/:patientId', authenticate, upload.single('pdf'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No se recibió archivo PDF' }); return; }
    const pdfPath = req.file.path;
    const parsed = await parseAntropometriaPdf(pdfPath);
    const pdfUrl = `/uploads/measurements/${req.file.filename}`;
    res.json({ parsed, pdfUrl, filename: req.file.originalname });
  } catch (err) {
    console.error('Error parsing PDF:', err);
    res.status(500).json({ error: 'Error al procesar el PDF' });
  }
});

router.post('/:patientId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;
    const data = req.body;
    const measurement = await prisma.measurement.create({
      data: {
        patientId,
        measurementNumber: data.measurementNumber,
        measurementDate: new Date(data.measurementDate),
        weight: data.weight,
        height: data.height,
        seatedHeight: data.seatedHeight,
        age: data.age,
        diameters: data.diameters,
        perimeters: data.perimeters,
        skinfolds: data.skinfolds,
        bodyComposition: data.bodyComposition,
        sumOf6Skinfolds: data.sumOf6Skinfolds,
        muscleOseousIndex: data.muscleOseousIndex,
        basalMetabolism: data.basalMetabolism,
        physicalActivityLevel: data.physicalActivityLevel,
        totalEnergyExpenditure: data.totalEnergyExpenditure,
        objectives: data.objectives,
        pdfUrl: data.pdfUrl,
        rawPdfText: data.rawPdfText,
      },
    });
    res.status(201).json(measurement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar medición' });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const measurement = await prisma.measurement.update({ where: { id }, data: req.body });
    res.json(measurement);
  } catch {
    res.status(500).json({ error: 'Error al actualizar medición' });
  }
});

export default router;

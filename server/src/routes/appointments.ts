import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/patient/:patientId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;
    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      orderBy: { scheduledDate: 'desc' },
    });
    res.json(appointments);
  } catch {
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
});

router.get('/next/:patientId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;
    const appointment = await prisma.appointment.findFirst({
      where: { patientId, scheduledDate: { gte: new Date() }, status: 'scheduled' },
      orderBy: { scheduledDate: 'asc' },
    });
    res.json(appointment);
  } catch {
    res.status(500).json({ error: 'Error' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.body.patientId as string,
        scheduledDate: new Date(req.body.scheduledDate),
        patientNotes: req.body.patientNotes,
      },
    });
    res.status(201).json(appointment);
  } catch {
    res.status(500).json({ error: 'Error al crear turno' });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        patientNotes: req.body.patientNotes,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : undefined,
        status: req.body.status,
      },
    });
    res.json(appointment);
  } catch {
    res.status(500).json({ error: 'Error al actualizar turno' });
  }
});

export default router;

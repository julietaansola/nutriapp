import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const search = (req.query.search as string) || '';
    const patients = await prisma.patient.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        measurements: { orderBy: { measurementDate: 'desc' }, take: 1 },
        mealPlans: { where: { isActive: true }, take: 1 },
        appointments: { where: { scheduledDate: { gte: new Date() }, status: 'scheduled' }, orderBy: { scheduledDate: 'asc' }, take: 1 },
      },
      orderBy: { lastName: 'asc' },
    });
    res.json(patients);
  } catch {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

router.get('/stats', authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalPatients = await prisma.patient.count();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const measurementsThisMonth = await prisma.measurement.count({
      where: { measurementDate: { gte: startOfMonth } },
    });
    const upcomingAppointments = await prisma.appointment.count({
      where: { scheduledDate: { gte: now }, status: 'scheduled' },
    });
    const plansThisMonth = await prisma.mealPlan.count({
      where: { planDate: { gte: startOfMonth } },
    });
    res.json({ totalPatients, measurementsThisMonth, upcomingAppointments, plansThisMonth });
  } catch {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true } },
        measurements: { orderBy: { measurementDate: 'desc' } },
        mealPlans: { orderBy: { planDate: 'desc' }, include: { exchanges: true } },
        appointments: { orderBy: { scheduledDate: 'desc' } },
      },
    });
    if (!patient) { res.status(404).json({ error: 'Paciente no encontrado' }); return; }
    if (req.user?.role === 'PATIENT') {
      const userPatient = await prisma.patient.findUnique({ where: { userId: req.user.userId } });
      if (userPatient?.id !== patient.id) { res.status(403).json({ error: 'Acceso denegado' }); return; }
    }
    res.json(patient);
  } catch {
    res.status(500).json({ error: 'Error al obtener paciente' });
  }
});

router.put('/:id/notes', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const patient = await prisma.patient.update({ where: { id }, data: { notes: req.body.notes } });
    res.json({ notes: patient.notes });
  } catch {
    res.status(500).json({ error: 'Error al guardar notas' });
  }
});

router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, birthDate, phone, email, userId } = req.body;
    const patient = await prisma.patient.create({
      data: { firstName, lastName, birthDate: birthDate ? new Date(birthDate) : null, phone, email, userId },
    });
    res.status(201).json(patient);
  } catch {
    res.status(500).json({ error: 'Error al crear paciente' });
  }
});

export default router;

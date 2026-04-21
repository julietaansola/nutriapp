import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import patientsRoutes from './routes/patients';
import measurementsRoutes from './routes/measurements';
import mealplansRoutes from './routes/mealplans';
import recipesRoutes from './routes/recipes';
import appointmentsRoutes from './routes/appointments';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://nutriapp-frontend.onrender.com',
    /\.onrender\.com$/,
  ],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/measurements', measurementsRoutes);
app.use('/api/mealplans', mealplansRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/appointments', appointmentsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🌿 NutriApp server running on http://localhost:${PORT}`);
});

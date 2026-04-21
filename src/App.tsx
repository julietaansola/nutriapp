import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { PatientsListPage } from '@/pages/admin/PatientsListPage';
import { PatientDetailPage } from '@/pages/admin/PatientDetailPage';
import { ProgressPage } from '@/pages/patient/ProgressPage';
import { MealPlanPage } from '@/pages/patient/MealPlanPage';
import { RecipesPage } from '@/pages/patient/RecipesPage';
import { DownloadsPage } from '@/pages/patient/DownloadsPage';
import { AppointmentPage } from '@/pages/patient/AppointmentPage';

function RootRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/progreso'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/pacientes" element={<PatientsListPage />} />
          <Route path="/admin/pacientes/:id" element={<PatientDetailPage />} />
          {/* Patient routes */}
          <Route path="/progreso" element={<ProgressPage />} />
          <Route path="/plan" element={<MealPlanPage />} />
          <Route path="/recetas" element={<RecipesPage />} />
          <Route path="/descargas" element={<DownloadsPage />} />
          <Route path="/consulta" element={<AppointmentPage />} />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

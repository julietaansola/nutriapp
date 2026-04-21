import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, UtensilsCrossed,
  Lightbulb, Download, CalendarClock,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/pacientes', icon: Users, label: 'Pacientes' },
];

const patientNav = [
  { to: '/progreso', icon: TrendingUp, label: 'Progreso' },
  { to: '/plan', icon: UtensilsCrossed, label: 'Plan' },
  { to: '/recetas', icon: Lightbulb, label: 'Recetas' },
  { to: '/descargas', icon: Download, label: 'PDFs' },
  { to: '/consulta', icon: CalendarClock, label: 'Turno' },
];

export function MobileNav() {
  const { isAdmin } = useAuthStore();
  const nav = isAdmin() ? adminNav : patientNav;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex justify-around py-2">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 text-xs transition-colors ${
                isActive ? 'text-voit-forest' : 'text-muted-foreground'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

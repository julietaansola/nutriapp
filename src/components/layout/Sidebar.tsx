import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, UtensilsCrossed,
  Lightbulb, Download, CalendarClock, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from './ThemeToggle';

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/pacientes', icon: Users, label: 'Pacientes' },
];

const patientNav = [
  { to: '/progreso', icon: TrendingUp, label: 'Mi Progreso' },
  { to: '/plan', icon: UtensilsCrossed, label: 'Mi Plan' },
  { to: '/recetas', icon: Lightbulb, label: 'Ideas de Platos' },
  { to: '/descargas', icon: Download, label: 'Descargas' },
  { to: '/consulta', icon: CalendarClock, label: 'Próxima Consulta' },
];

export function Sidebar() {
  const { user, logout, isAdmin } = useAuthStore();
  const nav = isAdmin() ? adminNav : patientNav;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar h-screen sticky top-0">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-voit-forest">Nutri</span>
          <span className="text-voit-mint">App</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Nutrición & Composición Corporal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <ThemeToggle />
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-sidebar-accent/50"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

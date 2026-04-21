import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background sticky top-0 z-40">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-voit-forest">Nutri</span>
            <span className="text-voit-mint">App</span>
          </h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-card border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-sm text-muted-foreground flex items-center gap-1">
                <LogOut className="h-4 w-4" /> Salir
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

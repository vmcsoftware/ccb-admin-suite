import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Church,
  Users,
  Calendar,
  ShieldCheck,
  FileText,
  LayoutDashboard,
  Menu,
  X,
  Music,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Painel', icon: LayoutDashboard },
  { path: '/congregacoes', label: 'Congregações', icon: Church },
  { path: '/ministerio', label: 'Ministério', icon: Users },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
  { path: '/ensaios', label: 'Ensaios', icon: Music },
  { path: '/reforcos', label: 'Reforços', icon: ShieldCheck },
  { path: '/listas', label: 'Listas', icon: FileText },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar-gradient fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Church className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground font-sans">
              ADM Ituiutaba
            </h1>
            <p className="text-[10px] text-sidebar-foreground/60 font-sans">
              Congregação Cristã no Brasil
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all font-sans ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-sidebar-primary' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <p className="text-[10px] text-sidebar-foreground/40 text-center font-sans">
            Sistema de Gestão CCB v1.0
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground font-display">
            {navItems.find((i) => i.path === location.pathname)?.label || 'Painel'}
          </h2>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

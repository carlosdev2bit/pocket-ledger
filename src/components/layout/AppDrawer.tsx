import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadAlertsCount } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  ArrowLeftRight, 
  CreditCard, 
  TrendingUp, 
  PieChart, 
  Bell, 
  Download, 
  Settings,
  LogOut,
  Moon,
  Sun,
  Wallet,
  X
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/transacoes', icon: ArrowLeftRight, label: 'Transações' },
  { to: '/cartoes', icon: CreditCard, label: 'Cartões' },
  { to: '/investimentos', icon: TrendingUp, label: 'Investimentos' },
  { to: '/relatorios', icon: PieChart, label: 'Relatórios' },
  { to: '/alertas', icon: Bell, label: 'Alertas', badge: true },
  { to: '/backup', icon: Download, label: 'Backup' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
];

export function AppDrawer() {
  const [open, setOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();
  const location = useLocation();
  const unreadAlerts = getUnreadAlertsCount();

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="touch-target">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Meu Bolso</h2>
                <p className="text-sm opacity-80">Finanças Pessoais</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              const Icon = item.icon;
              
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-target",
                      isActive 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && unreadAlerts > 0 && (
                      <span className="bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                        {unreadAlerts}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t p-4 space-y-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-sm">Modo escuro</span>
            </div>
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={toggleDarkMode}
            />
          </div>

          {/* Logout */}
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

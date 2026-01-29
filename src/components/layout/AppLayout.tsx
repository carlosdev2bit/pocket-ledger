import { ReactNode } from 'react';
import { AppDrawer } from './AppDrawer';
import { MonthSelector } from './MonthSelector';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showMonthSelector?: boolean;
  showFab?: boolean;
  onFabClick?: () => void;
}

export function AppLayout({ 
  children, 
  title, 
  showMonthSelector = false,
  showFab = false,
  onFabClick
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <AppDrawer />
            {title && (
              <h1 className="text-lg font-semibold">{title}</h1>
            )}
          </div>
          
          {showMonthSelector && (
            <MonthSelector />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* FAB - Floating Action Button */}
      {showFab && onFabClick && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 animate-scale-in"
          onClick={onFabClick}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

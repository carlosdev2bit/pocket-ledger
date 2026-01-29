import { useMonth } from '@/contexts/MonthContext';
import { formatMonthYear } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

export function MonthSelector() {
  const { currentYear, currentMonth, goToPreviousMonth, goToNextMonth, goToCurrentMonth } = useMonth();
  
  const now = new Date();
  const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth();

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToPreviousMonth}
        className="touch-target"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <Button
        variant={isCurrentMonth ? "default" : "outline"}
        onClick={goToCurrentMonth}
        className="min-w-[140px] font-medium"
      >
        <CalendarDays className="h-4 w-4 mr-2" />
        {formatMonthYear(currentYear, currentMonth)}
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={goToNextMonth}
        className="touch-target"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

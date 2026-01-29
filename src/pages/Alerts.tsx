import { useState } from 'react';
import { getAlerts, markAlertAsRead, saveAlerts } from '@/lib/storage';
import { formatDate } from '@/lib/formatters';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, CreditCard, AlertTriangle, TrendingUp, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Alert } from '@/types/finance';

const alertIcons: Record<string, typeof Bell> = {
  bill_due: CreditCard,
  limit_warning: AlertTriangle,
  expense_high: TrendingUp,
};

const alertColors: Record<string, string> = {
  bill_due: 'text-warning bg-warning/10',
  limit_warning: 'text-destructive bg-destructive/10',
  expense_high: 'text-info bg-info/10',
};

export function Alerts() {
  const [alerts, setAlerts] = useState(getAlerts());

  const refreshAlerts = () => {
    setAlerts(getAlerts());
  };

  const handleMarkAsRead = (id: string) => {
    markAlertAsRead(id);
    refreshAlerts();
  };

  const handleMarkAllAsRead = () => {
    const updatedAlerts = alerts.map(a => ({ ...a, isRead: true }));
    saveAlerts(updatedAlerts);
    toast({
      title: 'Alertas marcados como lidos',
    });
    refreshAlerts();
  };

  const handleClearAll = () => {
    saveAlerts([]);
    toast({
      title: 'Alertas limpos',
    });
    refreshAlerts();
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <AppLayout title="Alertas">
      <div className="p-4 space-y-4">
        {/* Actions */}
        {alerts.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Marcar todos como lidos
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-muted-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar todos
            </Button>
          </div>
        )}

        {/* Alert List */}
        {sortedAlerts.length > 0 ? (
          <div className="space-y-2">
            {sortedAlerts.map((alert) => {
              const Icon = alertIcons[alert.type] || Bell;
              const colorClass = alertColors[alert.type] || 'text-muted-foreground bg-muted';

              return (
                <Card 
                  key={alert.id} 
                  className={cn(
                    "transition-all",
                    alert.isRead && "opacity-60"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={cn("p-2 rounded-full shrink-0", colorClass)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className={cn(
                              "font-medium",
                              !alert.isRead && "font-semibold"
                            )}>
                              {alert.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.message}
                            </p>
                          </div>
                          {!alert.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => handleMarkAsRead(alert.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <BellOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Nenhum alerta</h3>
              <p className="text-sm text-muted-foreground">
                Você será notificado sobre faturas, limites e gastos importantes
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

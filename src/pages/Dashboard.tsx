import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMonth } from '@/contexts/MonthContext';
import { getTransactionsByMonth, getCreditCards, getInvestments, getUnreadAlertsCount } from '@/lib/storage';
import { formatCurrency } from '@/lib/formatters';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  PiggyBank,
  Bell,
  ArrowRight,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';

export function Dashboard() {
  const navigate = useNavigate();
  const { currentYear, currentMonth } = useMonth();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  
  const summary = useMemo(() => {
    const transactions = getTransactionsByMonth(currentYear, currentMonth);
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expense,
      balance: income - expense,
      transactionCount: transactions.length,
    };
  }, [currentYear, currentMonth]);

  const cards = getCreditCards();
  const investments = getInvestments();
  const totalInvested = investments.reduce((sum, inv) => sum + inv.currentBalance, 0);
  const unreadAlerts = getUnreadAlertsCount();

  return (
    <AppLayout 
      showMonthSelector 
      showFab 
      onFabClick={() => setShowAddTransaction(true)}
    >
      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-80">Saldo do mês</span>
                <Wallet className="h-5 w-5 opacity-80" />
              </div>
              <p className={cn(
                "text-3xl font-bold",
                summary.balance < 0 && "text-red-200"
              )}>
                {formatCurrency(summary.balance)}
              </p>
              <p className="text-sm mt-2 opacity-80">
                {summary.transactionCount} transações
              </p>
            </CardContent>
          </Card>

          {/* Income & Expense Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Income */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-income/10">
                    <TrendingUp className="h-4 w-4 text-income" />
                  </div>
                  <span className="text-sm text-muted-foreground">Receitas</span>
                </div>
                <p className="text-xl font-bold text-income">
                  {formatCurrency(summary.income)}
                </p>
              </CardContent>
            </Card>

            {/* Expense */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-expense/10">
                    <TrendingDown className="h-4 w-4 text-expense" />
                  </div>
                  <span className="text-sm text-muted-foreground">Despesas</span>
                </div>
                <p className="text-xl font-bold text-expense">
                  {formatCurrency(summary.expense)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Acesso rápido</h2>
          
          {/* Credit Cards */}
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/cartoes')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-secondary/10">
                  <CreditCard className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">Cartões de Crédito</p>
                  <p className="text-sm text-muted-foreground">
                    {cards.length} {cards.length === 1 ? 'cartão' : 'cartões'} cadastrados
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Investments */}
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/investimentos')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-success/10">
                  <PiggyBank className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">Investimentos</p>
                  <p className="text-sm text-muted-foreground">
                    Total: {formatCurrency(totalInvested)}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/alertas')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-full",
                  unreadAlerts > 0 ? "bg-warning/10" : "bg-muted"
                )}>
                  <Bell className={cn(
                    "h-5 w-5",
                    unreadAlerts > 0 ? "text-warning" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <p className="font-medium">Alertas</p>
                  <p className="text-sm text-muted-foreground">
                    {unreadAlerts > 0 
                      ? `${unreadAlerts} ${unreadAlerts === 1 ? 'alerta pendente' : 'alertas pendentes'}`
                      : 'Nenhum alerta pendente'
                    }
                  </p>
                </div>
              </div>
              {unreadAlerts > 0 && (
                <span className="bg-warning text-warning-foreground text-xs font-bold rounded-full h-6 min-w-[24px] flex items-center justify-center px-2">
                  {unreadAlerts}
                </span>
              )}
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {summary.transactionCount === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Nenhuma transação este mês</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Toque no botão + para adicionar sua primeira transação
              </p>
              <Button onClick={() => setShowAddTransaction(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar transação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AddTransactionDialog 
        open={showAddTransaction} 
        onOpenChange={setShowAddTransaction} 
      />
    </AppLayout>
  );
}

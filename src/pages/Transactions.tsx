import { useState, useMemo } from 'react';
import { useMonth } from '@/contexts/MonthContext';
import { getTransactionsByMonth, getCategories, deleteTransaction } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { AppLayout } from '@/components/layout/AppLayout';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TrendingUp, TrendingDown, Filter, Trash2, Edit, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Transaction } from '@/types/finance';

export function Transactions() {
  const { currentYear, currentMonth } = useMonth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const categories = getCategories();
  
  const transactions = useMemo(() => {
    let list = getTransactionsByMonth(currentYear, currentMonth);
    
    if (filter !== 'all') {
      list = list.filter(t => t.type === filter);
    }
    
    if (categoryFilter !== 'all') {
      list = list.filter(t => t.categoryId === categoryFilter);
    }
    
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentYear, currentMonth, filter, categoryFilter]);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      toast({
        title: 'Transação excluída',
        description: 'A transação foi removida com sucesso.',
      });
      setDeleteId(null);
    }
  };

  return (
    <AppLayout 
      title="Transações" 
      showMonthSelector
      showFab
      onFabClick={() => setShowAddDialog(true)}
    >
      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transaction List */}
        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      transaction.type === 'income' 
                        ? "bg-income/10" 
                        : "bg-expense/10"
                    )}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5 text-income" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-expense" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryName(transaction.categoryId)} • {formatDate(transaction.date)}
                      </p>
                      {transaction.installments && transaction.installments > 1 && (
                        <p className="text-xs text-muted-foreground">
                          {transaction.currentInstallment}/{transaction.installments}x
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className={cn(
                        "font-bold",
                        transaction.type === 'income' ? "text-income" : "text-expense"
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Nenhuma transação encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {filter !== 'all' || categoryFilter !== 'all'
                  ? 'Tente alterar os filtros'
                  : 'Adicione sua primeira transação'}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova transação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AddTransactionDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

import { useState, useMemo } from 'react';
import { 
  getInvestments, 
  getMovementsByInvestment, 
  addInvestment, 
  addInvestmentMovement,
  deleteInvestment 
} from '@/lib/storage';
import { formatCurrency, formatPercent, formatDate } from '@/lib/formatters';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PiggyBank, Plus, Trash2, TrendingUp, ArrowUpCircle, ArrowDownCircle, Percent } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Investment } from '@/types/finance';

export function Investments() {
  const [investments, setInvestments] = useState(getInvestments());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState<{ investment: Investment; type: 'deposit' | 'withdrawal' } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    type: '',
    initialBalance: '',
    yieldPercentage: '',
  });
  const [movementAmount, setMovementAmount] = useState('');

  const refreshInvestments = () => {
    setInvestments(getInvestments());
  };

  const totalInvested = useMemo(() => 
    investments.reduce((sum, inv) => sum + inv.currentBalance, 0),
    [investments]
  );

  const handleAddInvestment = () => {
    if (!newInvestment.name || !newInvestment.type) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe o nome e o tipo do investimento.',
        variant: 'destructive',
      });
      return;
    }

    const balance = parseFloat(newInvestment.initialBalance.replace(/\D/g, '')) / 100 || 0;
    const yieldRate = parseFloat(newInvestment.yieldPercentage.replace(',', '.')) || 0;

    addInvestment({
      name: newInvestment.name.trim(),
      type: newInvestment.type.trim(),
      currentBalance: balance,
      yieldPercentage: yieldRate,
    });

    toast({
      title: 'Investimento adicionado!',
      description: `${newInvestment.name} foi cadastrado.`,
    });

    setNewInvestment({ name: '', type: '', initialBalance: '', yieldPercentage: '' });
    setShowAddDialog(false);
    refreshInvestments();
  };

  const handleMovement = () => {
    if (!showMovementDialog || !movementAmount) return;

    const amount = parseFloat(movementAmount.replace(/\D/g, '')) / 100;
    if (amount <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Informe um valor maior que zero.',
        variant: 'destructive',
      });
      return;
    }

    if (showMovementDialog.type === 'withdrawal' && amount > showMovementDialog.investment.currentBalance) {
      toast({
        title: 'Saldo insuficiente',
        description: 'O valor do resgate é maior que o saldo disponível.',
        variant: 'destructive',
      });
      return;
    }

    addInvestmentMovement({
      investmentId: showMovementDialog.investment.id,
      type: showMovementDialog.type,
      amount,
      date: new Date().toISOString(),
    });

    toast({
      title: showMovementDialog.type === 'deposit' ? 'Aplicação realizada!' : 'Resgate realizado!',
      description: formatCurrency(amount),
    });

    setMovementAmount('');
    setShowMovementDialog(null);
    refreshInvestments();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteInvestment(deleteId);
      toast({
        title: 'Investimento excluído',
        description: 'O investimento foi removido com sucesso.',
      });
      setDeleteId(null);
      refreshInvestments();
    }
  };

  const calculateYield = (investment: Investment) => {
    const dailyRate = investment.yieldPercentage / 365 / 100;
    const monthlyRate = investment.yieldPercentage / 12 / 100;
    return {
      daily: investment.currentBalance * dailyRate,
      monthly: investment.currentBalance * monthlyRate,
    };
  };

  return (
    <AppLayout title="Investimentos" showFab onFabClick={() => setShowAddDialog(true)}>
      <div className="p-4 space-y-4">
        {/* Total Card */}
        <Card className="bg-gradient-to-br from-success to-success/80 text-success-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-80">Total investido</span>
              <PiggyBank className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalInvested)}</p>
            <p className="text-sm mt-2 opacity-80">
              {investments.length} {investments.length === 1 ? 'investimento' : 'investimentos'}
            </p>
          </CardContent>
        </Card>

        {/* Investments List */}
        {investments.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-2">
            {investments.map((investment) => {
              const movements = getMovementsByInvestment(investment.id);
              const yields = calculateYield(investment);

              return (
                <AccordionItem key={investment.id} value={investment.id} className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 rounded-full bg-success/10">
                        <TrendingUp className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">{investment.name}</p>
                        <p className="text-sm text-muted-foreground">{investment.type}</p>
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-bold">{formatCurrency(investment.currentBalance)}</p>
                      <p className="text-xs text-success flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        {investment.yieldPercentage}% a.a.
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {/* Yield Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Rendimento diário</p>
                        <p className="font-medium text-success">+{formatCurrency(yields.daily)}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Rendimento mensal</p>
                        <p className="font-medium text-success">+{formatCurrency(yields.monthly)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mb-4">
                      <Button 
                        className="flex-1" 
                        onClick={() => setShowMovementDialog({ investment, type: 'deposit' })}
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Aplicar
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowMovementDialog({ investment, type: 'withdrawal' })}
                      >
                        <ArrowDownCircle className="h-4 w-4 mr-2" />
                        Resgatar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(investment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* History */}
                    {movements.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Histórico</p>
                        <div className="space-y-1">
                          {movements.slice(0, 5).map((mov) => (
                            <div key={mov.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {mov.type === 'deposit' ? 'Aplicação' : 'Resgate'} - {formatDate(mov.date)}
                              </span>
                              <span className={mov.type === 'deposit' ? 'text-success' : 'text-expense'}>
                                {mov.type === 'deposit' ? '+' : '-'}{formatCurrency(mov.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <PiggyBank className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Nenhum investimento</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cadastre seus investimentos para acompanhar o rendimento
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar investimento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Investment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Investimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={newInvestment.name}
                onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                placeholder="Ex: Poupança Nubank"
              />
            </div>
            <div>
              <Label>Tipo *</Label>
              <Input
                value={newInvestment.type}
                onChange={(e) => setNewInvestment({ ...newInvestment, type: e.target.value })}
                placeholder="Ex: Poupança, CDB, Tesouro..."
              />
            </div>
            <div>
              <Label>Saldo inicial</Label>
              <Input
                value={newInvestment.initialBalance}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const number = parseInt(value || '0', 10) / 100;
                  setNewInvestment({ ...newInvestment, initialBalance: formatCurrency(number) });
                }}
                placeholder="R$ 0,00"
                inputMode="numeric"
              />
            </div>
            <div>
              <Label>Rendimento anual (%)</Label>
              <Input
                value={newInvestment.yieldPercentage}
                onChange={(e) => setNewInvestment({ ...newInvestment, yieldPercentage: e.target.value })}
                placeholder="Ex: 12.5"
                inputMode="decimal"
              />
            </div>
            <Button onClick={handleAddInvestment} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar investimento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={!!showMovementDialog} onOpenChange={() => setShowMovementDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showMovementDialog?.type === 'deposit' ? 'Aplicar' : 'Resgatar'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {showMovementDialog && (
              <>
                <p className="text-sm text-muted-foreground">
                  {showMovementDialog.investment.name} - Saldo: {formatCurrency(showMovementDialog.investment.currentBalance)}
                </p>
                <div>
                  <Label>Valor</Label>
                  <Input
                    value={movementAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const number = parseInt(value || '0', 10) / 100;
                      setMovementAmount(formatCurrency(number));
                    }}
                    placeholder="R$ 0,00"
                    inputMode="numeric"
                    className="text-xl"
                  />
                </div>
                <Button 
                  onClick={handleMovement} 
                  className="w-full"
                  variant={showMovementDialog.type === 'deposit' ? 'default' : 'outline'}
                >
                  {showMovementDialog.type === 'deposit' ? (
                    <>
                      <ArrowUpCircle className="h-4 w-4 mr-2" />
                      Confirmar aplicação
                    </>
                  ) : (
                    <>
                      <ArrowDownCircle className="h-4 w-4 mr-2" />
                      Confirmar resgate
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir investimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O investimento e todo o histórico serão removidos.
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

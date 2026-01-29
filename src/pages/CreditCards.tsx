import { useState, useMemo } from 'react';
import { getCreditCards, getCardPurchasesByCard, addCreditCard, deleteCreditCard } from '@/lib/storage';
import { formatCurrency } from '@/lib/formatters';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CreditCard as CardIcon, Plus, Trash2, Calendar, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CARD_COLORS = [
  '142 71% 45%', // Green
  '199 89% 48%', // Blue
  '262 83% 58%', // Purple
  '25 95% 53%',  // Orange
  '330 81% 60%', // Pink
  '0 0% 20%',    // Black
];

export function CreditCards() {
  const [cards, setCards] = useState(getCreditCards());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({
    name: '',
    limit: '',
    closingDay: '',
    dueDay: '',
    lastFourDigits: '',
    color: CARD_COLORS[0],
  });

  const refreshCards = () => {
    setCards(getCreditCards());
  };

  const handleAddCard = () => {
    if (!newCard.name || !newCard.limit || !newCard.closingDay || !newCard.dueDay) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    addCreditCard({
      name: newCard.name.trim(),
      limit: parseFloat(newCard.limit.replace(/\D/g, '')) / 100,
      closingDay: parseInt(newCard.closingDay),
      dueDay: parseInt(newCard.dueDay),
      lastFourDigits: newCard.lastFourDigits,
      color: newCard.color,
    });

    toast({
      title: 'Cartão adicionado!',
      description: `${newCard.name} foi cadastrado com sucesso.`,
    });

    setNewCard({
      name: '',
      limit: '',
      closingDay: '',
      dueDay: '',
      lastFourDigits: '',
      color: CARD_COLORS[0],
    });
    setShowAddDialog(false);
    refreshCards();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCreditCard(deleteId);
      toast({
        title: 'Cartão excluído',
        description: 'O cartão foi removido com sucesso.',
      });
      setDeleteId(null);
      refreshCards();
    }
  };

  const getCardUsage = (cardId: string) => {
    const purchases = getCardPurchasesByCard(cardId);
    return purchases.reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <AppLayout title="Cartões de Crédito" showFab onFabClick={() => setShowAddDialog(true)}>
      <div className="p-4 space-y-4">
        {cards.length > 0 ? (
          cards.map((card) => {
            const usage = getCardUsage(card.id);
            const usagePercent = (usage / card.limit) * 100;

            return (
              <Card 
                key={card.id} 
                className="overflow-hidden"
                style={{ borderLeftColor: `hsl(${card.color})`, borderLeftWidth: 4 }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: `hsl(${card.color} / 0.1)` }}
                      >
                        <CardIcon 
                          className="h-5 w-5" 
                          style={{ color: `hsl(${card.color})` }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{card.name}</h3>
                        {card.lastFourDigits && (
                          <p className="text-sm text-muted-foreground">
                            •••• {card.lastFourDigits}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Usage Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Utilizado</span>
                      <span className="font-medium">{formatCurrency(usage)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          usagePercent > 90 ? "bg-destructive" :
                          usagePercent > 70 ? "bg-warning" : "bg-primary"
                        )}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Limite: {formatCurrency(card.limit)}</span>
                      <span>{usagePercent.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha dia {card.closingDay}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                      <span>Vence dia {card.dueDay}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <CardIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Nenhum cartão cadastrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione seus cartões de crédito para controlar as faturas
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar cartão
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Card Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cartão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do cartão *</Label>
              <Input
                value={newCard.name}
                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                placeholder="Ex: Nubank, Itaú..."
              />
            </div>

            <div>
              <Label>Limite *</Label>
              <Input
                value={newCard.limit}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const number = parseInt(value || '0', 10) / 100;
                  setNewCard({ ...newCard, limit: formatCurrency(number) });
                }}
                placeholder="R$ 0,00"
                inputMode="numeric"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Dia de fechamento *</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={newCard.closingDay}
                  onChange={(e) => setNewCard({ ...newCard, closingDay: e.target.value })}
                  placeholder="1-31"
                />
              </div>
              <div>
                <Label>Dia de vencimento *</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={newCard.dueDay}
                  onChange={(e) => setNewCard({ ...newCard, dueDay: e.target.value })}
                  placeholder="1-31"
                />
              </div>
            </div>

            <div>
              <Label>Últimos 4 dígitos (opcional)</Label>
              <Input
                value={newCard.lastFourDigits}
                onChange={(e) => setNewCard({ ...newCard, lastFourDigits: e.target.value.slice(0, 4) })}
                placeholder="0000"
                maxLength={4}
              />
            </div>

            <div>
              <Label>Cor do cartão</Label>
              <div className="flex gap-2 mt-2">
                {CARD_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full transition-transform",
                      newCard.color === color && "ring-2 ring-offset-2 ring-primary scale-110"
                    )}
                    style={{ backgroundColor: `hsl(${color})` }}
                    onClick={() => setNewCard({ ...newCard, color })}
                  />
                ))}
              </div>
            </div>

            <Button onClick={handleAddCard} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar cartão
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cartão e todas as compras associadas serão removidos.
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

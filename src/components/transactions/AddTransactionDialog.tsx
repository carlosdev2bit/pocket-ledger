import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMonth } from '@/contexts/MonthContext';
import { addTransaction, getCategories } from '@/lib/storage';
import { formatCurrency, parseCurrencyInput } from '@/lib/formatters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TrendingUp, TrendingDown, CalendarIcon, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, 'Informe o valor'),
  description: z.string().min(1, 'Informe a descrição').max(100, 'Máximo 100 caracteres'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  date: z.date(),
  isRecurring: z.boolean(),
  recurrenceType: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  installments: z.number().min(1).max(999).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const { currentYear, currentMonth } = useMonth();
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const categories = getCategories();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      description: '',
      categoryId: '',
      date: new Date(currentYear, currentMonth, new Date().getDate()),
      isRecurring: false,
      recurrenceType: 'monthly',
      installments: 1,
    },
  });

  const filteredCategories = categories.filter(
    c => c.type === activeTab || c.type === 'both'
  );

  const isRecurring = form.watch('isRecurring');

  const handleTabChange = (value: string) => {
    const type = value as 'income' | 'expense';
    setActiveTab(type);
    form.setValue('type', type);
    form.setValue('categoryId', '');
  };

  const onSubmit = (data: TransactionFormData) => {
    const amount = parseCurrencyInput(data.amount);
    
    if (amount <= 0) {
      form.setError('amount', { message: 'Valor deve ser maior que zero' });
      return;
    }

    addTransaction({
      type: data.type,
      amount,
      description: data.description.trim(),
      categoryId: data.categoryId,
      date: data.date.toISOString(),
      isRecurring: data.isRecurring,
      recurrenceType: data.isRecurring ? data.recurrenceType : undefined,
      installments: data.installments,
      currentInstallment: 1,
    });

    toast({
      title: data.type === 'income' ? 'Receita adicionada!' : 'Despesa adicionada!',
      description: `${data.description} - ${formatCurrency(amount)}`,
    });

    form.reset();
    onOpenChange(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const number = parseInt(value || '0', 10) / 100;
    form.setValue('amount', formatCurrency(number));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Despesa
            </TabsTrigger>
            <TabsTrigger value="income" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Receita
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="R$ 0,00"
                        className="text-2xl font-bold h-14"
                        onChange={handleAmountChange}
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Almoço, Salário..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recurring Toggle */}
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Repeat className="h-4 w-4" />
                        Transação recorrente
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Recurrence Type */}
              {isRecurring && (
                <FormField
                  control={form.control}
                  name="recurrenceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Installments (only for expenses) */}
              {activeTab === 'expense' && !isRecurring && (
                <FormField
                  control={form.control}
                  name="installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={999}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          placeholder="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12"
                variant={activeTab === 'income' ? 'default' : 'destructive'}
              >
                {activeTab === 'income' ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Adicionar Receita
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Adicionar Despesa
                  </>
                )}
              </Button>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

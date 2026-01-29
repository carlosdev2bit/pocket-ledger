import { useState, useMemo } from 'react';
import { useMonth } from '@/contexts/MonthContext';
import { getTransactionsByMonth, getCategories } from '@/lib/storage';
import { formatCurrency, getMonthName } from '@/lib/formatters';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChartIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = [
  'hsl(142, 71%, 45%)', // Primary green
  'hsl(199, 89%, 48%)', // Blue
  'hsl(262, 83%, 58%)', // Purple
  'hsl(25, 95%, 53%)',  // Orange
  'hsl(330, 81%, 60%)', // Pink
  'hsl(38, 92%, 50%)',  // Yellow
  'hsl(174, 62%, 47%)', // Teal
  'hsl(0, 84%, 60%)',   // Red
];

export function Reports() {
  const { currentYear, currentMonth } = useMonth();
  const [showDetailed, setShowDetailed] = useState(false);
  const categories = getCategories();

  const data = useMemo(() => {
    const transactions = getTransactionsByMonth(currentYear, currentMonth);
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Group by category
    const byCategory: Record<string, { name: string; amount: number; color: string }> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = categories.find(c => c.id === t.categoryId);
        const name = category?.name || 'Outros';
        if (!byCategory[t.categoryId]) {
          byCategory[t.categoryId] = { 
            name, 
            amount: 0,
            color: category?.color || '150 10% 45%'
          };
        }
        byCategory[t.categoryId].amount += t.amount;
      });

    const categoryData = Object.values(byCategory)
      .sort((a, b) => b.amount - a.amount)
      .map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length],
      }));

    // Monthly comparison (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      const monthTransactions = getTransactionsByMonth(year, month);
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const monthExpense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      monthlyData.push({
        name: getMonthName(month).substring(0, 3),
        receitas: monthIncome,
        despesas: monthExpense,
      });
    }

    return { income, expense, balance: income - expense, categoryData, monthlyData };
  }, [currentYear, currentMonth, categories]);

  return (
    <AppLayout title="Relatórios" showMonthSelector>
      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-income/10">
                  <TrendingUp className="h-4 w-4 text-income" />
                </div>
                <span className="text-sm text-muted-foreground">Receitas</span>
              </div>
              <p className="text-xl font-bold text-income">
                {formatCurrency(data.income)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-expense/10">
                  <TrendingDown className="h-4 w-4 text-expense" />
                </div>
                <span className="text-sm text-muted-foreground">Despesas</span>
              </div>
              <p className="text-xl font-bold text-expense">
                {formatCurrency(data.expense)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Balance */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Saldo do mês</span>
              <span className={cn(
                "text-2xl font-bold",
                data.balance >= 0 ? "text-income" : "text-expense"
              )}>
                {formatCurrency(data.balance)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown - Simple View */}
        {!showDetailed && data.categoryData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Despesas por categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.categoryData.slice(0, 5).map((category, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.fill }}
                    />
                    <span className="flex-1 text-sm">{category.name}</span>
                    <span className="font-medium">{formatCurrency(category.amount)}</span>
                    <span className="text-sm text-muted-foreground">
                      {((category.amount / data.expense) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Toggle Detailed View */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowDetailed(!showDetailed)}
        >
          {showDetailed ? 'Voltar para visão simples' : 'Ver relatório detalhado'}
          <ChevronRight className={cn(
            "h-4 w-4 ml-2 transition-transform",
            showDetailed && "rotate-90"
          )} />
        </Button>

        {/* Detailed View */}
        {showDetailed && (
          <Tabs defaultValue="pie" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pie" className="gap-2">
                <PieChartIcon className="h-4 w-4" />
                Por categoria
              </TabsTrigger>
              <TabsTrigger value="bar" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Evolução
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pie">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Despesas por categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.categoryData.length > 0 ? (
                    <>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="amount"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {data.categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => formatCurrency(value)}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-2">
                        {data.categoryData.map((category, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.fill }}
                              />
                              <span className="text-sm">{category.name}</span>
                            </div>
                            <span className="font-medium">{formatCurrency(category.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma despesa neste mês
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bar">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Evolução mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.monthlyData}>
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          hide 
                        />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Bar 
                          dataKey="receitas" 
                          name="Receitas" 
                          fill="hsl(142, 76%, 36%)" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="despesas" 
                          name="Despesas" 
                          fill="hsl(0, 84%, 60%)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}

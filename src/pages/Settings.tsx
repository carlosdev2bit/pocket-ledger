import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getCategories, addCategory, deleteCategory, clearAllData } from '@/lib/storage';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Moon, 
  Sun, 
  Lock, 
  Tag, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Fingerprint,
  Palette
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Category } from '@/types/finance';

export function Settings() {
  const { settings, updateSettings, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [categories, setCategories] = useState(getCategories());
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense' | 'both',
  });

  const refreshCategories = () => {
    setCategories(getCategories());
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome da categoria.',
        variant: 'destructive',
      });
      return;
    }

    addCategory({
      name: newCategory.name.trim(),
      icon: 'Tag',
      type: newCategory.type,
      color: '150 10% 45%',
      isDefault: false,
    });

    toast({
      title: 'Categoria criada!',
      description: newCategory.name,
    });

    setNewCategory({ name: '', type: 'expense' });
    setShowAddCategory(false);
    refreshCategories();
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category?.isDefault) {
      toast({
        title: 'Não é possível excluir',
        description: 'Categorias padrão não podem ser removidas.',
        variant: 'destructive',
      });
      return;
    }

    deleteCategory(id);
    toast({
      title: 'Categoria excluída',
    });
    refreshCategories();
  };

  const handleResetApp = () => {
    clearAllData();
    toast({
      title: 'Dados apagados',
      description: 'Todos os dados foram removidos.',
    });
    logout();
  };

  return (
    <AppLayout title="Configurações">
      <div className="p-4 space-y-4">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Modo escuro</p>
                  <p className="text-sm text-muted-foreground">
                    Tema escuro para ambientes com pouca luz
                  </p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Biometria</p>
                  <p className="text-sm text-muted-foreground">
                    Usar impressão digital ou Face Unlock
                  </p>
                </div>
              </div>
              <Switch 
                checked={settings?.useBiometrics || false} 
                onCheckedChange={(checked) => updateSettings({ useBiometrics: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categorias
              </CardTitle>
              <Button size="sm" onClick={() => setShowAddCategory(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Nova
              </Button>
            </div>
            <CardDescription>
              Gerencie as categorias de receitas e despesas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                >
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.type === 'income' ? 'Receita' : 
                       category.type === 'expense' ? 'Despesa' : 'Ambos'}
                      {category.isDefault && ' • Padrão'}
                    </p>
                  </div>
                  {!category.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zona de perigo
            </CardTitle>
            <CardDescription>
              Ações irreversíveis que afetam todos os seus dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setShowResetConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Apagar todos os dados
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>Meu Bolso v1.0.0</p>
          <p>Desenvolvido com ❤️</p>
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Ex: Viagens, Pet..."
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select 
                value={newCategory.type} 
                onValueChange={(v) => setNewCategory({ ...newCategory, type: v as typeof newCategory.type })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddCategory} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Criar categoria
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar todos os dados?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá remover permanentemente todos os seus dados, incluindo transações, cartões, investimentos e configurações. Esta ação NÃO pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetApp}
              className="bg-destructive text-destructive-foreground"
            >
              Sim, apagar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

import { useState } from 'react';
import { exportBackup, importBackup, getSettings, saveSettings } from '@/lib/storage';
import { formatDate } from '@/lib/formatters';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Download, Upload, FileJson, AlertTriangle, CheckCircle, History } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { BackupData } from '@/types/finance';

export function Backup() {
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const settings = getSettings();

  const handleExport = () => {
    try {
      const data = exportBackup();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `meubolso-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last backup date
      if (settings) {
        saveSettings({ ...settings, lastBackup: new Date().toISOString() });
      }

      toast({
        title: 'Backup exportado!',
        description: 'O arquivo foi baixado para seu dispositivo.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível criar o backup.',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as BackupData;
        
        // Validate backup structure
        if (!data.version || !data.settings || !data.transactions) {
          throw new Error('Formato de backup inválido');
        }

        setPendingImport(data);
        setShowImportConfirm(true);
      } catch (error) {
        toast({
          title: 'Arquivo inválido',
          description: 'O arquivo selecionado não é um backup válido.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImport = () => {
    if (!pendingImport) return;

    try {
      importBackup(pendingImport);
      toast({
        title: 'Backup restaurado!',
        description: 'Seus dados foram importados com sucesso.',
      });
      setShowImportConfirm(false);
      setPendingImport(null);
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Erro ao importar',
        description: 'Não foi possível restaurar o backup.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout title="Backup e Restauração">
      <div className="p-4 space-y-4">
        {/* Last Backup Info */}
        {settings?.lastBackup && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <History className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Último backup</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(settings.lastBackup)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar dados
            </CardTitle>
            <CardDescription>
              Baixe todos os seus dados em um arquivo JSON para guardar em local seguro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full">
              <FileJson className="h-4 w-4 mr-2" />
              Exportar backup
            </Button>
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar dados
            </CardTitle>
            <CardDescription>
              Restaure seus dados a partir de um arquivo de backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-warning/10 rounded-lg flex gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Atenção:</strong> Importar um backup irá substituir todos os dados atuais. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div>
              <Input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dicas de backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-success shrink-0" />
              <p className="text-sm text-muted-foreground">
                Faça backup regularmente, pelo menos uma vez por semana
              </p>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-success shrink-0" />
              <p className="text-sm text-muted-foreground">
                Guarde o arquivo em um local seguro, como Google Drive ou iCloud
              </p>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-success shrink-0" />
              <p className="text-sm text-muted-foreground">
                Mantenha múltiplas versões de backup para maior segurança
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Confirmation */}
      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar importação</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingImport && (
                <>
                  <p className="mb-2">
                    Você está prestes a importar um backup de{' '}
                    <strong>{formatDate(pendingImport.exportedAt)}</strong>.
                  </p>
                  <p>
                    Isso irá <strong>substituir</strong> todos os seus dados atuais. Esta ação não pode ser desfeita.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImport(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>
              Importar e substituir dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

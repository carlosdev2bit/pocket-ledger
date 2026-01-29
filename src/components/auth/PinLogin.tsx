import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PinPad } from './PinPad';
import { toast } from '@/hooks/use-toast';

export function PinLogin() {
  const { login } = useAuth();
  const [attempts, setAttempts] = useState(0);

  const handleComplete = (pin: string) => {
    const success = login(pin);
    if (!success) {
      setAttempts(prev => prev + 1);
      toast({
        title: "PIN incorreto",
        description: attempts >= 2 
          ? "Muitas tentativas incorretas. Tente novamente em breve."
          : "Verifique e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleError = () => {
    setAttempts(prev => prev + 1);
  };

  return (
    <PinPad
      title="Meu Bolso"
      subtitle="Digite seu PIN para acessar"
      onComplete={handleComplete}
      onError={handleError}
    />
  );
}

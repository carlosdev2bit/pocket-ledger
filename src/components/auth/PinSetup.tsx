import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PinPad } from './PinPad';
import { toast } from '@/hooks/use-toast';

export function PinSetup() {
  const { setupPin } = useAuth();

  const handleComplete = (pin: string) => {
    setupPin(pin);
    toast({
      title: "PIN criado com sucesso!",
      description: "Seu app está protegido.",
    });
  };

  return (
    <PinPad
      title="Criar PIN"
      subtitle="Crie um PIN de 6 dígitos para proteger suas finanças"
      onComplete={handleComplete}
      isSetup
    />
  );
}

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Wallet, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinPadProps {
  onComplete: (pin: string) => void;
  onError?: () => void;
  title: string;
  subtitle: string;
  isSetup?: boolean;
}

export function PinPad({ onComplete, onError, title, subtitle, isSetup = false }: PinPadProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handlePinChange = (value: string) => {
    setError('');
    
    if (step === 'enter') {
      setPin(value);
      if (value.length === 6) {
        if (isSetup) {
          setStep('confirm');
        } else {
          onComplete(value);
        }
      }
    } else {
      setConfirmPin(value);
      if (value.length === 6) {
        if (value === pin) {
          onComplete(value);
        } else {
          setError('PINs não coincidem. Tente novamente.');
          setPin('');
          setConfirmPin('');
          setStep('enter');
          onError?.();
        }
      }
    }
  };

  const handleNumberClick = (num: string) => {
    const currentValue = step === 'enter' ? pin : confirmPin;
    if (currentValue.length < 6) {
      handlePinChange(currentValue + num);
    }
  };

  const handleBackspace = () => {
    if (step === 'enter') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (step === 'enter') {
      setPin('');
    } else {
      setConfirmPin('');
    }
  };

  const currentPin = step === 'enter' ? pin : confirmPin;
  const currentTitle = step === 'enter' ? title : 'Confirme seu PIN';
  const currentSubtitle = step === 'enter' ? subtitle : 'Digite o PIN novamente para confirmar';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{currentTitle}</CardTitle>
          <CardDescription className="text-base">
            {currentSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PIN Display */}
          <div className="flex justify-center items-center gap-2">
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all",
                    currentPin[index] 
                      ? "border-primary bg-primary/10" 
                      : "border-muted",
                    error && "border-destructive"
                  )}
                >
                  {currentPin[index] ? (showPin ? currentPin[index] : '•') : ''}
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPin(!showPin)}
              className="ml-2"
            >
              {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>

          {error && (
            <p className="text-center text-sm text-destructive font-medium animate-scale-in">
              {error}
            </p>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <Button
                key={num}
                variant="outline"
                className="h-14 text-2xl font-semibold hover:bg-primary hover:text-primary-foreground touch-target"
                onClick={() => handleNumberClick(num)}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="h-14 text-sm font-medium text-muted-foreground touch-target"
              onClick={handleClear}
            >
              Limpar
            </Button>
            <Button
              variant="outline"
              className="h-14 text-2xl font-semibold hover:bg-primary hover:text-primary-foreground touch-target"
              onClick={() => handleNumberClick('0')}
            >
              0
            </Button>
            <Button
              variant="ghost"
              className="h-14 text-2xl touch-target"
              onClick={handleBackspace}
            >
              ⌫
            </Button>
          </div>

          {/* Biometric option placeholder */}
          {!isSetup && (
            <div className="pt-2 text-center">
              <Button variant="link" className="text-muted-foreground">
                <Lock className="h-4 w-4 mr-2" />
                Usar biometria
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground text-center">
        Meu Bolso • Finanças Pessoais
      </p>
    </div>
  );
}

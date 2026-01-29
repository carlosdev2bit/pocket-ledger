import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings, saveSettings, initializeSettings, AppSettings } from '@/lib/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isFirstAccess: boolean;
  settings: AppSettings | null;
  login: (pin: string) => boolean;
  logout: () => void;
  setupPin: (pin: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const savedSettings = getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
      setIsFirstAccess(false);
    } else {
      setIsFirstAccess(true);
    }
  }, []);

  const login = (pin: string): boolean => {
    if (settings && settings.pin === pin) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const setupPin = (pin: string) => {
    const newSettings = initializeSettings(pin);
    setSettings(newSettings);
    setIsFirstAccess(false);
    setIsAuthenticated(true);
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    if (settings) {
      const updated = { 
        ...settings, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      saveSettings(updated);
      setSettings(updated);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isFirstAccess,
      settings,
      login,
      logout,
      setupPin,
      updateSettings,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

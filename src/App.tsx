import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MonthProvider } from "@/contexts/MonthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Dashboard } from "@/pages/Dashboard";
import { Transactions } from "@/pages/Transactions";
import { CreditCards } from "@/pages/CreditCards";
import { Investments } from "@/pages/Investments";
import { Reports } from "@/pages/Reports";
import { Alerts } from "@/pages/Alerts";
import { Backup } from "@/pages/Backup";
import { Settings } from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <MonthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthGuard>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/transacoes" element={<Transactions />} />
                  <Route path="/cartoes" element={<CreditCards />} />
                  <Route path="/investimentos" element={<Investments />} />
                  <Route path="/relatorios" element={<Reports />} />
                  <Route path="/alertas" element={<Alerts />} />
                  <Route path="/backup" element={<Backup />} />
                  <Route path="/configuracoes" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthGuard>
            </BrowserRouter>
          </TooltipProvider>
        </MonthProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

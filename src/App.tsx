import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Congregacoes from "./pages/Congregacoes";
import Ministerio from "./pages/Ministerio";
import Agenda from "./pages/Agenda";
import Reforcos from "./pages/Reforcos";
import Listas from "./pages/Listas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/congregacoes" element={<Congregacoes />} />
            <Route path="/ministerio" element={<Ministerio />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/reforcos" element={<Reforcos />} />
            <Route path="/listas" element={<Listas />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

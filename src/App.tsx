import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import Signup from "./pages/Signup";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import MagneticCursor from "@/components/MagneticCursor";
import RouteTransition from "@/components/RouteTransition";
import { injectGoogle } from "@/components/admin/AdminGoogle";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import ProjectDetail from "./pages/ProjectDetail";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import RefundPolicy from "./pages/RefundPolicy";
import Apps from "./pages/Apps";
import GoogleVerify from "./pages/GoogleVerify";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/p/:slug" element={<ProjectDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Signup />} />
        <Route path="/:file" element={<GoogleVerify />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppShell() {
  useAuthBootstrap();
  useEffect(() => { injectGoogle(); }, []);
  return (
    <MotionConfig reducedMotion="user">
      <RouteTransition />
      <MagneticCursor />
      <AnimatedRoutes />
    </MotionConfig>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <SonnerToaster position="top-center" richColors />
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

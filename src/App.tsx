import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import MagneticCursor from "@/components/MagneticCursor";
import RouteTransition from "@/components/RouteTransition";

const Index = lazy(() => import("./pages/Index"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Apps = lazy(() => import("./pages/Apps"));
const Signup = lazy(() => import("./pages/Signup"));
const GoogleVerify = lazy(() => import("./pages/GoogleVerify"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
  useEffect(() => {
    void import("@/components/admin/AdminGoogle").then(({ injectGoogle }) => injectGoogle());
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <RouteTransition />
      <MagneticCursor />
      <Suspense fallback={<PageLoader />}>
        <AnimatedRoutes />
      </Suspense>
    </MotionConfig>
  );
}

function PageLoader() {
  return (
    <div className="min-h-dvh grid place-items-center bg-[#070b14] text-white" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <span className="absolute inset-0 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl" />
          <span className="absolute inset-2 animate-spin rounded-xl border-2 border-transparent border-t-[#ff7657] border-r-[#78f3c6]" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">Loading studio</span>
      </div>
    </div>
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

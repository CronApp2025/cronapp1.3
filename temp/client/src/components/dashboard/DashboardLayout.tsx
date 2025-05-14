
import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { MobileNavigation } from "./mobile-navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Cargando dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header activePath={window.location.pathname} />
      
      <div className="flex-1 flex flex-col lg:flex-row">
        {!isMobile && (
          <div className="lg:w-64 bg-white border-r border-neutral-200">
            <Sidebar className="sticky top-0 p-4" />
          </div>
        )}
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
      {isMobile && <MobileNavigation />}
    </div>
  );
}

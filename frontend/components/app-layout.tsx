import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/auth": "Login or register",
  "/dashboard": "Dashboard",
  "/resources": "Resources",
  "/staff": "Staff workspace",
};

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  const title =
    pageTitles[pathname] ??
    (pathname.startsWith("/resources/") ? "Resource details" : "Page");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 md:px-8">
          <SidebarTrigger />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>/</span>
            <span className="font-medium text-foreground">{title}</span>
          </div>
        </header>
        <main className="flex flex-1 flex-col px-4 py-6 md:px-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

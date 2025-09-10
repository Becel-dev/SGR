import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider } from '@/hooks/use-sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
        <AppSidebar />
        <div className="flex flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto bg-muted/40 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

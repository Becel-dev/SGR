import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 pt-2 md:p-6 md:pt-2">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

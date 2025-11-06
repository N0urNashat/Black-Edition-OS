import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { ClientSidebar } from '@/components/client-portal/client-sidebar';
import { Header } from '@/components/dashboard/header';

export default function ClientPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Client Sidebar */}
      <ClientSidebar orgSlug={params.orgSlug} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden md:ml-64">
        {/* Header */}
        <Header orgSlug={params.orgSlug} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t px-6 py-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <p>© 2025 Black Edition Agency. All rights reserved.</p>
            <p>Client Portal</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

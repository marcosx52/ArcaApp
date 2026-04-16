import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-[1480px] p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Topbar />
          {children}
        </main>
      </div>
    </div>
  );
}

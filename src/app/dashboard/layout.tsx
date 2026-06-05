"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Users, LogOut, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out');
        router.push('/login');
        router.refresh();
      }
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white dark:bg-zinc-900 px-6 shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
          <span className="hidden md:inline-block tracking-tight">The Date Crew</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}

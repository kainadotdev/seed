'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, Home, Rss, User as UserIcon, LogOut, Users, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/home', label: 'Início', icon: Home },
  { href: '/timeline', label: 'Timeline', icon: Rss },
  { href: '/search', label: 'Buscar', icon: Search },
  { href: '/community', label: 'Comunidade', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-none flex-col gap-1 border-r border-border bg-bg-2 p-3.5">
      <div className="flex items-center gap-2 px-2.5 pb-5 pt-2 font-bold">
        <Sprout size={22} className="text-seed-green" /> Seed
      </div>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
            pathname === href ? 'bg-seed-green-light font-semibold text-seed-green' : 'text-text-dim hover:bg-card'
          }`}
        >
          <Icon size={17} /> {label}
        </Link>
      ))}
      {user && (
        <Link
          href={`/profile/${user.username}`}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
            pathname.startsWith('/profile') ? 'bg-seed-green-light font-semibold text-seed-green' : 'text-text-dim hover:bg-card'
          }`}
        >
          <UserIcon size={17} /> Perfil
        </Link>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <ThemeToggle />
        {user && (
          <Link href={`/profile/${user.username}`} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 hover:bg-card">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-seed-green-2 to-seed-green text-xs font-bold text-white">
              {user.name[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <b className="block truncate text-[13.5px]">{user.name}</b>
              <span className="text-xs text-text-faint">@{user.username}</span>
            </div>
          </Link>
        )}
        <Button variant="ghost" size="sm" onClick={() => logout()}>
          <LogOut size={14} /> Sair
        </Button>
      </div>
    </aside>
  );
}

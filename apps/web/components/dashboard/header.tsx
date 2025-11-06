'use client';

import { UserButton } from '@clerk/nextjs';
import { Search, Bell, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  orgSlug: string;
}

export function Header({ orgSlug }: HeaderProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Skip org slug
    const start = paths[0] === orgSlug ? 1 : 0;

    for (let i = start; i < paths.length; i++) {
      const segment = paths[i];
      const href = '/' + paths.slice(0, i + 1).join('/');
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${orgSlug}`} className="hover:text-foreground">
          Dashboard
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-2">
            <span>/</span>
            {index === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full pl-9"
        />
      </div>

      {/* Quick Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="bg-[#93DA97] text-black hover:bg-[#93DA97]/90">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/leads/new`}>New Lead</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/customers/new`}>New Customer</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/projects/new`}>New Project</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/tasks/new`}>New Task</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/invoices/new`}>New Invoice</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
        >
          3
        </Badge>
      </Button>

      {/* User Menu */}
      <UserButton afterSignOutUrl="/" />
    </header>
  );
}

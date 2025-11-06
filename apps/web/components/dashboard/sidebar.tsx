'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  CheckSquare,
  Clock,
  DollarSign,
  CreditCard,
  BarChart3,
  Brain,
  Settings,
  ChevronDown,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface SidebarProps {
  orgSlug: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

export function Sidebar({ orgSlug }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'CRM',
    'Financial',
  ]);

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: `/${orgSlug}`,
      icon: LayoutDashboard,
    },
    {
      title: 'CRM',
      href: '',
      icon: Users,
      children: [
        {
          title: 'Leads',
          href: `/${orgSlug}/leads`,
          icon: Users,
        },
        {
          title: 'Customers',
          href: `/${orgSlug}/customers`,
          icon: Building2,
        },
      ],
    },
    {
      title: 'Projects',
      href: `/${orgSlug}/projects`,
      icon: FolderKanban,
    },
    {
      title: 'Tasks',
      href: `/${orgSlug}/tasks`,
      icon: CheckSquare,
    },
    {
      title: 'Time Tracking',
      href: `/${orgSlug}/time`,
      icon: Clock,
    },
    {
      title: 'Financial',
      href: '',
      icon: DollarSign,
      children: [
        {
          title: 'Invoices',
          href: `/${orgSlug}/invoices`,
          icon: DollarSign,
        },
        {
          title: 'Payments',
          href: `/${orgSlug}/payments`,
          icon: CreditCard,
        },
      ],
    },
    {
      title: 'Reports',
      href: `/${orgSlug}/reports`,
      icon: BarChart3,
    },
    {
      title: 'AI Tools',
      href: `/${orgSlug}/ai`,
      icon: Brain,
    },
    {
      title: 'Automations',
      href: `/${orgSlug}/automations`,
      icon: Zap,
    },
    {
      title: 'Settings',
      href: `/${orgSlug}/settings`,
      icon: Settings,
    },
  ];

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === `/${orgSlug}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.title);
    const active = item.href ? isActive(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.title} className="space-y-1">
          <button
            onClick={() => toggleSection(item.title)}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              depth > 0 && 'pl-9'
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </button>
          {isExpanded && (
            <div className="space-y-1 pl-4">
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
          active && 'bg-[#93DA97] text-black hover:bg-[#93DA97]/90',
          depth > 0 && 'pl-9'
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link
              href={`/${orgSlug}`}
              className="flex items-center gap-2 font-bold text-xl"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                BE
              </div>
              <span>Black Edition</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => renderNavItem(item))}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              © 2025 Black Edition
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

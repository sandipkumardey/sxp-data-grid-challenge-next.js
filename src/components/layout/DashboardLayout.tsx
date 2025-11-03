'use client';

import { useState, useEffect } from 'react';
import {
  Menu, X, Settings, Home, BarChart2, Users, FileText, 
  Filter, LayoutGrid, ChevronDown, ChevronRight, 
  Plus, MoreVertical, Bell, HelpCircle, AlertCircle, CheckCircle2, Clock, AlertTriangle,
  ChevronLeft, PanelLeftClose
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

type NavItem = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  id: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const activeNav = pathname.split('/')[1] || 'dashboard';

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored) {
      setSidebarCollapsed(JSON.parse(stored));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed, mounted]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      icon: Home,
      href: '/',
      id: 'dashboard',
      badge: '3',
      badgeVariant: 'secondary'
    },
    {
      name: 'Applications',
      icon: FileText,
      href: '/applications',
      id: 'applications',
      badge: '12',
      badgeVariant: 'default'
    },
    {
      name: 'Analytics',
      icon: BarChart2,
      href: '/analytics',
      id: 'analytics',
      badge: 'New',
      badgeVariant: 'success'
    },
    {
      name: 'Team',
      icon: Users,
      href: '/team',
      id: 'team',
      badge: '5',
      badgeVariant: 'secondary'
    },
  ];

  const secondaryNav = [
    { name: 'Settings', icon: Settings, href: '/settings', id: 'settings' },
    { name: 'Help & Support', icon: HelpCircle, href: '/support', id: 'support' },
  ];

  // Prevent hydration mismatch by only rendering the UI after mounting
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background transition-theme">
      {/* Sidebar */}
      <div
        className={`group fixed inset-y-0 left-0 z-30 transform border-r transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        } w-64 ${sidebarCollapsed ? 'border-border/50' : 'border-border bg-muted/20 backdrop-blur-sm shadow-sm'}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <LayoutGrid className="h-6 w-6 text-primary flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-foreground tracking-tight truncate">
                Lynk
              </span>
            )}
          </div>

          {/* Collapse Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-center">
                  <p>{sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</p>
                  <p className="text-xs text-muted-foreground mt-1">⌘B</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mobile Close Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Close sidebar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Sidebar Scrollable Content */}
        <div className="h-[calc(100%-4rem)] overflow-y-auto p-4">
          {/* Primary Nav */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              const Icon = item.icon;
              return (
                <TooltipProvider key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm border border-primary/20'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 transition-colors ${
                            isActive
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground group-hover:text-foreground'
                          } ${sidebarCollapsed ? 'mr-0' : 'mr-3'}`}
                          aria-hidden="true"
                        />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 truncate">{item.name}</span>
                            {item.badge && (
                              <Badge
                                variant={item.badgeVariant || 'secondary'}
                                className={`ml-2 flex-shrink-0 ${
                                  item.badgeVariant === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                  item.badgeVariant === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                  item.badgeVariant === 'destructive' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''
                                }`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {sidebarCollapsed && (
                      <TooltipContent side="right" className="ml-2">
                        <div className="text-center">
                          <p className="font-medium">{item.name}</p>
                          {item.badge && (
                            <Badge
                              variant={item.badgeVariant || 'secondary'}
                              className="mt-1 text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </nav>

          {/* Secondary Nav */}
          <div
            className={`mt-8 pt-4 ${
              sidebarCollapsed ? 'border-t-0' : 'border-t border-border'
            }`}
          >
            {!sidebarCollapsed && (
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account
              </h3>
            )}
            <nav className="space-y-1">
              {secondaryNav.map((item) => {
                const isActive = activeNav === item.id;
                const Icon = item.icon;
                return (
                  <TooltipProvider key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-sm border border-primary/20'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon
                            className={`h-5 w-5 flex-shrink-0 transition-colors ${
                              isActive
                                ? 'text-primary-foreground'
                                : 'text-muted-foreground group-hover:text-foreground'
                            } ${sidebarCollapsed ? 'mr-0' : 'mr-3'}`}
                            aria-hidden="true"
                          />
                          {!sidebarCollapsed && (
                            <span className="flex-1 truncate">{item.name}</span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {sidebarCollapsed && (
                        <TooltipContent side="right" className="ml-2">
                          <p className="font-medium">{item.name}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </nav>
          </div>
            </div>
      </div>
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200/50 bg-white/80 px-6 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>

            <div className="hidden items-center md:flex">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {navItems.find((item) => item.id === activeNav)?.name || 'Dashboard'}
              </h1>
              <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activeNav === 'applications' ? 'All Applications' : 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50"
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50"
                    aria-label={
                      theme === 'dark'
                        ? 'Switch to light mode'
                        : 'Switch to dark mode'
                    }
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5 text-yellow-400 transition-transform duration-200 hover:rotate-12" />
                    ) : (
                      <Moon className="h-5 w-5 text-gray-600 transition-transform duration-200 hover:-rotate-12 dark:text-gray-400" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {theme === 'dark'
                      ? 'Switch to light mode'
                      : 'Switch to dark mode'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="hidden h-8 w-px bg-gray-200 dark:bg-gray-700 md:block" />

            <div className="hidden items-center space-x-2 md:flex">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">John Doe</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {activeNav === 'applications' ? '' : 'Dashboard Overview'}
                </h2>
                <p className="text-sm text-muted-foreground font-normal">
                  {activeNav === 'applications'
                    ? ''
                    : 'Get an overview of your job search progress'}
                </p>
              </div>

              {activeNav !== 'applications' && (
                <div className="mt-4 flex items-center space-x-2 md:mt-0">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    <span>View</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

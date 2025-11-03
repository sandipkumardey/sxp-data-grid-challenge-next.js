'use client';

import { useState, useEffect } from 'react';
import { 
  Menu, X, Settings, Home, BarChart2, Users, FileText, 
  Search, Filter, LayoutGrid, ChevronDown, ChevronRight, 
  Plus, MoreVertical, Bell, HelpCircle, AlertCircle, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const activeNav = pathname.split('/')[1] || 'dashboard';

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
        className={cn(
          'group fixed inset-y-0 left-0 z-30 transform border-r transition-all duration-300 ease-in-out lg:hover:w-72',
          !sidebarOpen && 'lg:w-16 lg:hover:w-64',
          sidebarOpen && 'w-64',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'border-border bg-foreground/10 backdrop-blur-md shadow-xl' : 'border-transparent'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Lynk</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Close sidebar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="h-[calc(100%-4rem)] overflow-y-auto p-4">
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
                        className={cn(
                          'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md border border-primary/20 dark:bg-primary/90 dark:text-primary-foreground dark:shadow-lg dark:border-primary/30 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-accent before:rounded-r-full'
                            : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:shadow-sm',
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon
                          className={cn(
                            'mr-3 h-5 w-5 flex-shrink-0',
                            isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400',
                          )}
                          aria-hidden="true"
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge 
                            variant={item.badgeVariant || 'secondary'} 
                            className={cn(
                              'ml-2',
                              item.badgeVariant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                              item.badgeVariant === 'warning' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                              item.badgeVariant === 'destructive' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-gray-200 pt-4 dark:border-gray-800">
            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Account
            </h3>
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
                        className={cn(
                          'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md border border-primary/20 dark:bg-primary/90 dark:text-primary-foreground dark:shadow-lg dark:border-primary/30'
                            : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:shadow-sm',
                        )}
                        aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon
                            className={cn(
                              'mr-3 h-5 w-5 flex-shrink-0',
                              isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400',
                            )}
                            aria-hidden="true"
                          />
                          <span>{item.name}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="group flex w-full items-center justify-center rounded-lg p-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:scale-105 dark:text-gray-300 dark:hover:bg-gray-800"
                      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-5 w-5 text-yellow-400 transition-transform duration-200 group-hover:rotate-12" />
                      ) : (
                        <Moon className="h-5 w-5 text-gray-600 transition-transform duration-200 group-hover:-rotate-12 dark:text-gray-400" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                {navItems.find((item) => item.id === activeNav)?.name || 'Dashboard'}
              </h1>
              <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activeNav === 'applications' ? 'All Applications' : 'Overview'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="w-full rounded-full pl-9 md:w-64"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            
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
            {/* Page Header */}
            <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {activeNav === 'applications' ? 'Job Applications' : 'Dashboard Overview'}
                </h2>
                <p className="text-sm text-muted-foreground font-normal">
                  {activeNav === 'applications' 
                    ? 'Manage and track your job applications' 
                    : 'Get an overview of your job search progress'}
                </p>
              </div>
              
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
            </div>

            {/* Main Content */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

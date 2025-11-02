'use client';

import { useState } from 'react';
import { 
  Menu, X, Settings, Home, BarChart2, Users, FileText, 
  Search, Filter, LayoutGrid, ChevronDown, ChevronRight, 
  Plus, MoreVertical, Bell, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const activeNav = pathname.split('/')[1] || 'dashboard';

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/', id: 'dashboard', badge: '3' },
    { name: 'Applications', icon: FileText, href: '/applications', id: 'applications', badge: '12' },
    { name: 'Analytics', icon: BarChart2, href: '/analytics', id: 'analytics' },
    { name: 'Team', icon: Users, href: '/team', id: 'team', badge: '5' },
  ];

  const secondaryNav = [
    { name: 'Settings', icon: Settings, href: '/settings', id: 'settings' },
    { name: 'Help & Support', icon: HelpCircle, href: '/support', id: 'support' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-gradient-to-b from-primary/5 to-white shadow-lg transition-all duration-300 ease-in-out dark:from-gray-800 dark:to-gray-800/95 md:relative',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'border-r border-gray-200/50 dark:border-gray-700/50'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200/50 px-6 dark:border-gray-700/50">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">JobTrack</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            <div className="mb-6 mt-2 px-2">
              <Button className="w-full justify-start gap-2" size="sm">
                <Plus className="h-4 w-4" />
                New Application
              </Button>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    activeNav === item.id || (activeNav === '' && item.id === 'dashboard')
                      ? 'bg-primary/10 text-primary shadow-sm dark:bg-primary/20'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon 
                      className={cn(
                        'mr-3 h-5 w-5 transition-transform',
                        (activeNav === item.id || (activeNav === '' && item.id === 'dashboard')) 
                          ? 'scale-110' 
                          : 'group-hover:scale-110'
                      )} 
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge 
                      variant={activeNav === item.id ? 'default' : 'secondary'}
                      className="h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-8 space-y-1">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Workspace
              </h3>
              {secondaryNav.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50',
                    activeNav === item.id ? 'text-primary dark:text-primary' : ''
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200/50 p-4 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">John Doe</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
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
              className="mr-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
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
                <p className="text-sm text-muted-foreground">
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
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Application</span>
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

'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the ApplicationsGrid component with SSR disabled
const ApplicationsGrid = dynamic(
  () => import('@/features/applications/components/ApplicationsGrid').then(mod => mod.ApplicationsGrid),
  { 
    ssr: false, 
    loading: () => (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Skeleton className="h-10 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </div>
    )
  }
);

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Job Applications
        </h1>
        <p className="text-muted-foreground">
          View and manage job applications with filtering, sorting, and export capabilities
        </p>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <ApplicationsGrid />
      </div>
    </div>
  );
}

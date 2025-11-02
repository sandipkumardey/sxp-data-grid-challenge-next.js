'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ApplicationsGrid component with SSR disabled
const ApplicationsGrid = dynamic(
  () => import('../features/applications/components/ApplicationsGrid').then(mod => mod.ApplicationsGrid),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading applications...</span>
      </div>
    )
  }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Job Applications Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage job applications with filtering, sorting, and export capabilities
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <ApplicationsGrid />
        </div>
      </main>
    </div>
  );
}

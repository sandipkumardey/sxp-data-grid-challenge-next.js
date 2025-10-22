// src/components/ui/loading.tsx
import { Loader2 } from 'lucide-react';

export function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading...</span>
    </div>
  );
}
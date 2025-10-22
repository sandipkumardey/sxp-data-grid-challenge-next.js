// src/components/data-grid/SearchInput.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
  value?: string;
}

export function SearchInput({ 
  onSearch, 
  placeholder = 'Search...',
  delay = 300,
  value
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(value ?? '');
  useEffect(() => {
    setSearchTerm(value ?? '');
  }, [value]);
  const [debouncedSearchTerm] = useDebounce(searchTerm, delay);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-9"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
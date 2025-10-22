// src/hooks/useGridState.ts
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from 'nuqs';

export const useGridState = () => {
  return useQueryStates(
    {
      sortModel: parseAsArrayOf(parseAsString).withDefault([]),
      filterModel: parseAsString.withDefault(''),
      columnState: parseAsString.withDefault(''),
      columnGroupState: parseAsString.withDefault(''),
      paginationPageSize: parseAsInteger.withDefault(20),
      paginationPage: parseAsInteger.withDefault(0),
      searchQuery: parseAsString.withDefault(''),
      hiddenColumns: parseAsArrayOf(parseAsString).withDefault([]),
      skills: parseAsArrayOf(parseAsString).withDefault([]),
    },
    {
      history: 'push',
      shallow: false,
    }
  );
};
export interface Skill {
  name: string;
  experience: string;
  lastUsed: string;
  isPrimary: boolean;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  ctc: string;
  employer: string;
  currentContractType: string | null;
  currentWorkType: string | null;
  preferredWorkType: string;
  matchPercentage: number;
  offerCTC: string;
  offersInHand: string;
  overallExperience: string;
  willingToRelocate: boolean;
  expectedCTC: string;
  skills: Skill[];
  [key: string]: any; // For dynamic access to other properties
}

export type SortModel = {
  colId: string;
  sort: 'asc' | 'desc' | null;
}[];

export type FilterModel = {
  [key: string]: any;
};

export interface GridState {
  sortModel: SortModel;
  filterModel: FilterModel;
  columnState: any[];
  columnGroupState: any[];
  pagination: {
    pageSize: number;
    currentPage: number;
  };
  searchQuery: string;
}

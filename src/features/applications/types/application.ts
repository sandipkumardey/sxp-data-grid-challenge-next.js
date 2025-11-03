export interface Skill {
  id: string;
  name: string;
  years: string;
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
  offerCTC: string | number;
  offersInHand: string;
  overallExperience: string;
  willingToRelocate: boolean;
  expectedCTC: string;
  noticePeriod: string;
  applicationStatus: string;
  attachmentFileExtension: string;
  createdAt: string;
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

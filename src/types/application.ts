// src/types/application.ts
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
  ctc: string | number;
  employer: string;
  currentContractType: string | null;
  currentWorkType: string | null;
  preferredWorkType: string;
  matchPercentage: number;
  offerCTC: string | number;
  offersInHand: string | number;
  overallExperience: string | number;
  willingToRelocate: boolean;
  expectedCTC: string | number;
  noticePeriod: string | number;
  applicationStatus: string;
  attachmentFileExtension: string;
  createdAt: string;
  skills: Skill[];
}

export type ColumnDefinition = {
  field: string;
  headerName: string;
  sortable?: boolean;
  filter?: boolean | string;
  hide?: boolean;
  pinned?: 'left' | 'right';
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  cellRenderer?: (params: unknown) => unknown;
  valueFormatter?: (params: { value: unknown }) => string;
  filterParams?: unknown;
  checkboxSelection?: boolean;
  headerCheckboxSelection?: boolean;
  showDisabledCheckboxes?: boolean;
  cellStyle?: (params: { value: unknown }) => React.CSSProperties | undefined;
};
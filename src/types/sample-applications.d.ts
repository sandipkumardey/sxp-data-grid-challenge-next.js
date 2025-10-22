// src/types/sample-applications.d.ts
declare module '@/data/sample-applications.json' {
  import { Application } from './application';
  const data: Application[];
  export default data;
}
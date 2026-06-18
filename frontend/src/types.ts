export type JobType = 'Internship' | 'Full-time' | 'Part-time';
export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
export type ApiMode = 'rest' | 'graphql';

export interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  job_type: JobType;
  status: ApplicationStatus;
  applied_date: string;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  optimistic?: boolean;
}

export interface ApplicationInput {
  company_name: string;
  job_title: string;
  job_type: JobType;
  status: ApplicationStatus;
  applied_date: string;
  notes: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface ApplicationsResponse {
  data: JobApplication[];
  pagination: Pagination;
}

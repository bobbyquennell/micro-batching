export type JobStatus = 'created' | 'submitted' | 'processed' | 'failed';
export interface JobResult {
  id: string;
  status: JobStatus;
  error?: Error;
}

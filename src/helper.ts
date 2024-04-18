import { Job, JobResult } from './Job';

export interface BatchProcessor<T> {
  processBatch: (jobs: Job<T>[]) => Promise<JobResult[]>;
}

export const mockBatchProcessor: BatchProcessor<string> = {
  processBatch: (jobs: Job<string>[]) => {
    console.log(
      'BatchProcessor: processing jobs: ',
      jobs.map((job) => job.data),
    );
    return Promise.all(
      jobs.map(async (job) => {
        try {
          // get async task done
          const result: JobResult = { id: job.id, status: 'processed' };
          console.log(
            `BatchProcessor: job ${job.id} is processed, result:`,
            result,
          );
          return result;
        } catch (error) {
          const result: JobResult = {
            id: job.id,
            status: 'failed',
            error: error as Error,
          };
          console.warn(`BatchProcessor: job ${job.id} failed, result:`, result);
          return result;
        }
      }),
    );
  },
};

import { Job, JobResult } from '../Job';
import { BatchProcessor } from '../helper';

import { BatchingOptions } from './types';

export class MicroBatcher<T> {
  #jobs: Job<T>[] = [];
  #batchProcessor: BatchProcessor<T>;
  #options: BatchingOptions;
  #timer?: NodeJS.Timeout;
  #isShuttingDown = false;
  #isProcessing = false;

  get jobs() {
    return this.#jobs;
  }
  constructor(options: BatchingOptions, batchProcessor: BatchProcessor<T>) {
    this.#options = options;
    this.#batchProcessor = batchProcessor;
  }

  batchingOption(options: BatchingOptions) {
    this.#options = options;
  }

  submit = async (newJob: Job<T>): Promise<JobResult> => {
    console.log('submit: submitting new job: ', newJob.data);
    if (this.#isShuttingDown) {
      console.log(
        'MicroBatcher is shutting down, cannot accept new job: ',
        newJob.id,
      );
      return newJob.callback({
        id: newJob.id,
        status: 'failed',
        error: new Error('MicroBatcher is shutting down'),
      });
    }

    this.#jobs.push(newJob);
    let results: JobResult[] = [];
    if (
      this.#options.batchSize &&
      this.#jobs.length >= this.#options.batchSize &&
      !this.#isProcessing
    ) {
      console.log(
        `submit: batch size reached ${this.#options.batchSize}, start processing jobs`,
      );
      this.#isProcessing = true;
      results = await this.processBatch();
      this.#isProcessing = false;
    } else if (
      !this.#timer &&
      this.#options.batchInterval &&
      this.#jobs.length > 0
    ) {
      console.log(
        'batcher will process jobs every: ',
        this.#options.batchInterval,
        'ms',
      );
      this.#timer = setInterval(async () => {
        console.log('batcher triggered by timer');
        this.#isProcessing = true;
        results = await this.processBatch();
        this.#isProcessing = false;
        console.log('batcher process completed');
      }, this.#options.batchInterval);
    }
    const jobResult: JobResult = results.filter(
      (result) => result.id === newJob.id,
    )[0] ?? {
      id: newJob.id,
      status: 'submitted',
    };
    console.log(`submit: submitted new job ${newJob.id}, result: `, jobResult);
    return jobResult;
  };

  /**
   * Shuts down the micro-batcher. Waits for all Jobs to be processed before returning.
   */
  shutdown = async () => {
    this.#isShuttingDown = true;
    console.log('shutting down: ');
    if (this.#timer) {
      console.log('clear internal timer');
      clearInterval(this.#timer);
      this.#timer = undefined;
    }
    console.log('flushing job queue');
    while (this.#jobs.length > 0) {
      await this.processBatch();
    }
  };

  private async processBatch(): Promise<JobResult[]> {
    const batch = this.#jobs.splice(0, this.#options.batchSize);
    return await this.#batchProcessor.processBatch(batch);
  }
}

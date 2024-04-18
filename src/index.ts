import { Job } from './Job';
import { MicroBatcher } from './MicroBatcher';
import { mockBatchProcessor } from './helper';

const microBatcher = new MicroBatcher(
  { batchInterval: 1000, batchSize: 2 },
  mockBatchProcessor,
);

const jobs = Array.from(
  [1, 2, 3, 4, 5],
  (id) => new Job<string>(id.toString(), id.toString()),
);
for (const job of jobs) {
  microBatcher.submit(job);
}

console.log('batcher will continue running 10 seconds, before shutting down');
setTimeout(() => {
  microBatcher.shutdown().then(() => {
    if (microBatcher.jobs.length === 0) {
      console.log('All jobs processed');
    }
  });
  microBatcher.submit(new Job<string>('6', '6'));
}, 10000);

setTimeout(() => {
  microBatcher.submit(new Job<string>('7', '7'));
}, 10000);

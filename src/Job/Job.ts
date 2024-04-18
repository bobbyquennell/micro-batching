import { JobResult } from './types';

export class Job<T> {
  #id: string;
  #data: T;
  get id() {
    return this.#id;
  }
  get data() {
    return this.#data;
  }
  constructor(data: T, id: string) {
    this.#data = data;
    this.#id = id;
  }
  callback = (result: JobResult) => {
    return result;
  };
}

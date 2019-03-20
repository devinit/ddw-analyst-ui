export interface APIResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T
}

export interface APIResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T;
}
export interface Links {
  next: string | null;
  previous: string | null;
}
export type LinksMap = Map<keyof Links, Links[keyof Links]>;

export interface FetchOptions {
  limit?: number;
  offset?: number;
  link?: string;
  search?: string;
  id?: number;
}

import { List, Map } from 'immutable';

export type QueryName = 'filter' | 'join' | 'aggregate' | 'transform';
export interface Filter {
  field: string;
  value: string | number;
  func: 'lt' | 'le' | 'eq' | 'gt' | 'ge' | 'text_search' | 'ne';
}
export type FilterMap = Map<keyof Filter, Filter[keyof Filter]>;
export interface ErroredFilter extends Filter {
  error: { [P in keyof Filter]: string };
}
export type ErroredFilterMap = Map<keyof ErroredFilter, ErroredFilter[keyof ErroredFilter]>;
export interface Filters<T = Filter[] | ErroredFilter[]> {
  filters: T;
}
export interface Operation {
  id: number;
  name: string;
  description: string;
  operation_query: string;
  theme: string;
  sample_output_path: string;
  operation_steps: OperationStep[] | List<OperationStepMap>;
  is_draft: boolean;
  created_on: string;
  updated_on: string;
  user: string;
}
export type OperationMap = Map<keyof Operation, Operation[keyof Operation]>;
export interface OperationStep {
  id: number;
  step_id: number;
  name: string;
  description: string;
  query_func: QueryName;
  query_kwargs: string;
  source: number;
  created_on: string;
  updated_on: string;
}
export type OperationStepMap = Map<keyof OperationStep, OperationStep[keyof OperationStep]>;
export interface OperationDataAPIResponse {
  count: number;
  previous: string | null;
  next: string | null;
  results: List<OperationDataMap>;
}
export interface OperationData { [key: string]: string | number | null; }
export type OperationDataMap = Map<keyof OperationData, OperationData[keyof OperationData]>;
export type OperationDataAPIResponseMap = Map<keyof OperationDataAPIResponse, OperationDataAPIResponse[keyof OperationDataAPIResponse]> //tslint:disable-line

export interface JoinOptions {
  table_name: string;
  schema_name: string;
  join_on: { [key: string]: string };
}

export interface TransformOptions {
  operational_value: string;
  trans_func_name: string;
  operational_column: string;
  operational_columns: string[];
}

export interface AggregateOptions {
  group_by: string[];
  agg_func_name: string;
  operational_column: string;
}

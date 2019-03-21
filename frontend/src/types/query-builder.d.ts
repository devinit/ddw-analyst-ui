import { Map } from 'immutable';

export type QueryName = 'filter' | 'join' | 'aggregate' | 'transform';
export interface Filter {
  field: string;
  value: string | number;
  func: 'lt' | 'le' | 'eq' | 'gt' | 'ge' | 'text_search' | 'ne';
}
export type FilterMap = Map<keyof Filter, Filter[keyof Filter]>;
export interface Filters {
  filters: Filter[];
}
export interface Operation {
  pk: number;
  name: string;
  description: string;
  operation_query: string;
  theme: string;
  sample_output_path: string;
  operation_steps: List<OperationStepMap>;
  is_draft: boolean;
}
export type OperationMap = Map<keyof Operation, Operation[keyof Operation]>;
export interface OperationStep {
  pk: number;
  step_id: number;
  name: string;
  description: string;
  query_func: QueryName;
  query_kwargs: string;
  source_id: number;
  created_on: string;
  updated_on: string;
}
export type OperationStepMap = Map<keyof OperationStep, OperationStep[keyof OperationStep]>;

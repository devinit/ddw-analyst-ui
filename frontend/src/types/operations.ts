/* eslint-disable @typescript-eslint/naming-convention */
import { List, Map } from 'immutable';
import { OperationColumn, OperationColumnMap } from './sources';

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

export type AliasCreationStatus = 'p' | 'e' | 'd';
export interface Operation {
  alias_creation_status: AliasCreationStatus;
  id: number;
  name: string;
  description: string;
  operation_query: string;
  row_count: number | null;
  theme: string;
  sample_output_path: string;
  operation_steps: OperationStep[] | List<OperationStepMap>;
  is_draft: boolean;
  created_on: string;
  updated_on: string;
  user: string;
  aliases: OperationColumn[] | List<OperationColumnMap>;
  logs: Record<string, unknown>;
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
  logs: Record<string, unknown>;
}
export type OperationStepMap = Map<keyof OperationStep, OperationStep[keyof OperationStep]>;
export interface OperationDataAPIResponse {
  count: number;
  previous: string | null;
  next: string | null;
  results: List<OperationDataMap>;
}
export interface OperationData {
  [key: string]: string | number | null;
}
export type OperationDataMap = Map<keyof OperationData, OperationData[keyof OperationData]>;
export type OperationDataList = List<OperationDataMap>;
export type OperationDataAPIResponseMap = Map<
  keyof OperationDataAPIResponse,
  OperationDataAPIResponse[keyof OperationDataAPIResponse]
>; //tslint:disable-line

export interface JoinOptions {
  table_name: string;
  schema_name: string;
  join_on: { [key: string]: string };
  join_how: string;
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

export interface WindowOptions {
  window_fn: string;
  order_by: string[];
  over: string[];
  term: string;
  columns: string[];
}

export interface AdvancedQueryOptions {
  source: number;
  columns?: AdvancedQueryColumn[];
  filter?: AdvancedQueryFilter;
  join?: AdvancedQueryJoin;
  groupby?: OperationColumn[];
}

interface AdvancedQueryColumn extends OperationColumn {
  aggregate?: 'sum' | 'avg' | 'max' | 'min' | 'std';
}

type AdvancedQueryFilter = {
  $and?: (AdvancedQueryFilterComparator | AdvancedQueryFilter)[];
  $or?: (AdvancedQueryFilterComparator | AdvancedQueryFilter)[];
};

type AdvancedQueryFilterComparator = {
  column: string;
  value: string | number | (string | number)[];
  comp: '$eq' | '$neq' | '$gt' | '$lt' | '$gte' | '$lte' | '$btn' | '$in';
};

interface AdvancedQueryJoin {
  type: 'inner' | 'left' | 'right' | 'full';
  source: number;
  mapping: [string, string][];
}

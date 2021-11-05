/* eslint-disable @typescript-eslint/naming-convention */
import { List, Map } from 'immutable';
import { Column, OperationColumn, OperationColumnMap } from './sources';

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
  advanced_config: AdvancedQueryOptions | null;
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
  groupby?: string[];
  selectall?: boolean;
}
export type AdvancedQueryOptionsMap = Map<
  keyof AdvancedQueryOptions,
  AdvancedQueryOptions[keyof AdvancedQueryOptions]
>;

export interface AdvancedQueryColumn extends Partial<Column> {
  aggregate?: 'sum' | 'avg' | 'max' | 'min' | 'std';
}

export type AdvancedQueryBuilderAction =
  | 'select'
  | 'filter'
  | 'join'
  | 'having'
  | 'groupby'
  | 'orderby';

export type AdvancedQueryFilter = {
  $and?: (AdvancedQueryFilterComparator | AdvancedQueryFilter)[];
  $or?: (AdvancedQueryFilterComparator | AdvancedQueryFilter)[];
};

export type AdvancedQueryFilterComparator = {
  column: string;
  value: string | number | (string | number)[];
  comp: FilterComp;
};

export type AdvancedJQueryFilter = {
  condition?: string;
  rules?: (AdvancedJqueryFilterComparator | AdvancedQueryFilter)[];
};

export type AdvancedJqueryFilterComparator = {
  id: string;
  field: string;
  type: string;
  input: string;
  operator: JqueryQueryBuilderComps;
  value: string | number;
};

export const comp = ['$eq', '$neq', '$gt', '$lt', '$gte', '$lte', '$btn', '$in'] as const;
export type FilterComp = typeof comp[number];
export type JqueryQueryBuilderComps =
  | 'equal'
  | 'not_equal'
  | 'less'
  | 'less_or_equal'
  | 'greater'
  | 'greater_or_equal'
  | 'between'
  | 'in';

export type QueryBuilderRules = {
  condition?: 'AND' | 'OR';
  rules?: (QueryBuilderRulesComparator | QueryBuilderRules)[];
};

export type QueryBuilderRulesComparator = {
  id: string;
  field: string;
  type: string;
  input: string;
  operator: string;
  value: string | number;
};

export type JqueryBuilderFieldData = {
  id: string | number;
  label: string;
  type: string;
};

export type JqueryQueryBuilderIcons = {
  add_group: string;
  add_rule: string;
  remove_group: string;
  remove_rule: string;
  error: string;
};

export type JoinType =
  | 'inner'
  | 'outer'
  | 'left'
  | 'right'
  | 'full'
  | 'cross'
  | 'left_outer'
  | 'right_outer';
export type Aggregate = 'SUM' | 'MAX' | 'MIN' | 'AVG' | 'STD';

export interface AdvancedQueryJoin {
  type: JoinType;
  source: number;
  mapping: [string, string][];
  columns?: AdvancedQueryColumn[];
}

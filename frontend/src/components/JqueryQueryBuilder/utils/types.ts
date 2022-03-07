export type JqueryQueryBuilderFilter = {
  condition?: string;
  rules?: (JqueryQueryBuilderFilterComparator | JqueryQueryBuilderFilter)[];
};

export type JqueryQueryBuilderHaving = {
  condition?: string;
  rules?: (JqueryQueryBuilderHavingComparator | JqueryQueryBuilderHaving)[];
};

export type JqueryQueryBuilderHavingComparator = {
  id: string;
  field: string;
  type: string;
  input: string;
  operator: JqueryQueryBuilderComps;
  value?: string | number | { plain: string | number } | { column: string; aggregate: string };
  values?: { value: string; label: string }[];
};

export type JqueryQueryBuilderFilterComparator = {
  id: string;
  field: string;
  type: string;
  input: string;
  operator: JqueryQueryBuilderComps;
  value: string | number;
};
export type JqueryQueryBuilderComps =
  | 'equal'
  | 'not_equal'
  | 'less'
  | 'less_or_equal'
  | 'greater'
  | 'greater_or_equal'
  | 'between'
  | 'in';

export type JqueryQueryBuilderFieldData = {
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

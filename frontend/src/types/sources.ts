import { List, Map } from 'immutable';

export interface Source {
  pk: number;
  indicator: string;
  indicator_acronym: string | null;
  source: string | null;
  source_acronym: string | null;
  source_url: string | null;
  download_path: string | null;
  last_updated_on: string;
  storage_type: string | null;
  active_mirror_name: string | null;
  description: string | null;
  created_on: string;
  updated_on: string | null;
  columns: ColumnList;
  update_history: UpdateHistoryList;
}
export interface Column {
  pk: number;
  name: string | null;
  description: string | null;
  source_name: string | null;
}
export interface UpdateHistory {
  source: number;
  history_table: string | null;
  is_major_release: boolean;
  released_on: string | null;
  release_description: string | null;
  invalidated_on: string | null;
  invalidation_description: string | null;
}

export type SourceMap = Map<keyof Source, Source[keyof Source]>;
export type ColumnList = List<ColumnMap>;
export type ColumnMap = Map<keyof Column, Column[keyof Column]>;
export type UpdateHistoryMap = Map<keyof UpdateHistory, UpdateHistory[keyof UpdateHistory]>;
export type UpdateHistoryList = List<UpdateHistoryMap>;

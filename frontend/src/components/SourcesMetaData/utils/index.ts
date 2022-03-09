import { List } from 'immutable';
import { ColumnList, ColumnMap, SourceMap } from '../../../types/sources';
import { Data } from '../../TreeView/utils/types';

export const getFormattedColumnDataType = (column: ColumnMap, prefix = ''): string => {
  const dataType = column.get('data_type') as 'N' | 'C' | null;

  if (dataType === 'N') return `${prefix}number`;
  if (dataType === 'C') return `${prefix}text`;

  return '';
};

export const createTreeDataFromColumn = (column: ColumnMap): Data => ({
  id: column.get('id') as number,
  name: `${column.get('name')}${getFormattedColumnDataType(column, ' - ')}`,
});

export const createTreeDataFromSource = (source: SourceMap): Data => {
  const columns = source.get('columns') as ColumnList;
  const treeData: Data = {
    id: source.get('id') as number,
    name: source.get('active_mirror_name') as string,
    children: columns.map(createTreeDataFromColumn).toJS() as Data[],
  };

  return treeData;
};

export const createTreeDataFromSources = (sources: List<SourceMap>): Data[] =>
  sources.map(createTreeDataFromSource).toJS() as Data[];

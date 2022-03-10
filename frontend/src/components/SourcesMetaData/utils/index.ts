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

export const findInSources = (sources: List<SourceMap>, searchTerm: string): List<SourceMap> => {
  let results = List<SourceMap>();
  for (const source of sources) {
    const sourceName = source.get('active_mirror_name') as string;
    const sourceDescription = source.get('description') as string;
    const sourceIndicator = source.get('indicator') as string;
    const sourceIndicatorAcronym = source.get('indicator_acronym') as string;
    const sourceParent = source.get('source') as string;
    const sourceParentAcronym = source.get('source_acronym') as string;
    const columns = source.get('columns') as ColumnList;
    if (
      (sourceName && sourceName.toLowerCase().includes(searchTerm)) ||
      (sourceDescription && sourceDescription.toLowerCase().includes(searchTerm)) ||
      (sourceIndicator && sourceIndicator.toLowerCase().includes(searchTerm)) ||
      (sourceIndicatorAcronym && sourceIndicatorAcronym.toLowerCase().includes(searchTerm)) ||
      (sourceParent && sourceParent.toLowerCase().includes(searchTerm)) ||
      (sourceParentAcronym && sourceParentAcronym.toLowerCase().includes(searchTerm))
    ) {
      results = results.push(source);
    } else {
      for (const column of columns) {
        const name = column.get('name') as string;
        const alias = column.get('alias') as string;

        if (
          (name && name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (alias && alias.toLowerCase().includes(searchTerm.toLowerCase()))
        ) {
          results = results.push(source);
          break;
        }
      }
    }
  }

  return results;
};

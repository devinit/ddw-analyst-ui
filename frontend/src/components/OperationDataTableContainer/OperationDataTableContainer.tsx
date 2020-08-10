import { List } from 'immutable';
import React, { FunctionComponent } from 'react';
import { fetchOperationData } from '../../pages/QueryData/actions';
import { OperationDataMap, OperationMap } from '../../types/operations';
import { OperationDataTable } from '../OperationDataTable';
import { PaginationRow } from '../PaginationRow';
import { OperationColumn, OperationColumnMap } from '../../types/sources';

interface OperationDataTableContainerProps {
  operation: OperationMap;
  list?: List<OperationDataMap>;
  id: string;
  limit: number;
  offset: number;
  count: number;
  fetchData: typeof fetchOperationData;
}

// const getColumns = (item?: OperationDataMap): string[] => {
//   if (item) {
//     const columns: string[] = [];
//     item.mapKeys((key: string) => columns.push(key));

//     return columns;
//   }

//   return [];
// };

export const OperationDataTableContainer: FunctionComponent<OperationDataTableContainerProps> = (
  props,
) => {
  const { fetchData, id, limit, list, count, operation } = props;
  const aliases = operation.get('aliases') as List<OperationColumnMap>;
  const columns = aliases ? (aliases.toJS() as OperationColumn[]) : [];

  const onPageChange = (page: { selected: number }): void => {
    fetchData({
      id,
      limit,
      offset: page.selected * limit,
    });
  };

  if (list && list.count()) {
    return (
      <>
        <OperationDataTable list={list} columns={columns} />
        <PaginationRow
          pageRangeDisplayed={5}
          limit={limit}
          count={count}
          pageCount={Math.ceil(count / limit)}
          onPageChange={onPageChange}
        />
      </>
    );
  }

  return <div>No results found</div>;
};

OperationDataTableContainer.defaultProps = {
  limit: 10,
  offset: 0,
};

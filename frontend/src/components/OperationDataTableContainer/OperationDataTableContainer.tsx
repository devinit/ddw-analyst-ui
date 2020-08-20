import { List } from 'immutable';
import React, { FunctionComponent } from 'react';
import { fetchOperationData } from '../../pages/QueryData/actions';
import { OperationDataMap, OperationMap } from '../../types/operations';
import { OperationColumn, OperationColumnMap } from '../../types/sources';
import { OperationDataTable } from '../OperationDataTable';
import { PaginationRow } from '../PaginationRow';

interface OperationDataTableContainerProps {
  operation: OperationMap;
  list?: List<OperationDataMap>;
  id: string;
  limit: number;
  offset: number;
  count: number | null;
  fetchData: typeof fetchOperationData;
}

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
        <OperationDataTable list={list} columns={columns} editableHeaders />
        {count !== null ? (
          <PaginationRow
            pageRangeDisplayed={5}
            limit={limit}
            count={count}
            pageCount={Math.ceil(count / limit)}
            onPageChange={onPageChange}
          />
        ) : null}
      </>
    );
  }

  return <div>No results found</div>;
};

OperationDataTableContainer.defaultProps = {
  limit: 10,
  offset: 0,
};

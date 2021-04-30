import { fromJS, List } from 'immutable';
import React, { FunctionComponent } from 'react';
import { FetchOptions } from '../../types/api';
import { OperationData, OperationMap } from '../../types/operations';
import { OperationColumn, OperationColumnMap } from '../../types/sources';
import { OperationDataTable } from '../OperationDataTable';
import { PaginationRow } from '../PaginationRow';

interface OperationDataTableContainerProps {
  operation: OperationMap;
  list?: OperationData[];
  id: number;
  limit: number;
  offset: number;
  count: number | null;
  fetchData: (options: FetchOptions) => void;
}

export const OperationDataTableContainer: FunctionComponent<OperationDataTableContainerProps> = (
  props,
) => {
  const { fetchData, id, limit, list, count, operation } = props;

  const onPageChange = (page: { selected: number }): void => {
    fetchData({
      id,
      limit,
      offset: page.selected * limit,
    });
  };

  if (list && list.length) {
    const aliases = operation.get('aliases') as List<OperationColumnMap>;
    let columns: OperationColumn[] = [];
    if (aliases) {
      // make sure that the columns are in required order ... no using immutable as it messes up the order
      const _aliases = aliases.toJS() as OperationColumn[];
      columns = Object.keys(list[0]).map<OperationColumn>(
        (column) => _aliases.find((alias) => alias.column_name === column) as OperationColumn,
      );
    }

    return (
      <>
        <OperationDataTable list={fromJS(list)} columns={columns} editableHeaders />
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

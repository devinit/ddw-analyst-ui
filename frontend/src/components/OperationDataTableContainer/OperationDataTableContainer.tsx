import { fromJS, List } from 'immutable';
import React, { FunctionComponent } from 'react';
import { FetchOptions } from '../../types/api';
import { OperationData, OperationDataMap, OperationMap } from '../../types/operations';
import { OperationColumn, OperationColumnMap } from '../../types/sources';
import { formatString } from '../../utils';
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
    if (aliases && aliases.count()) {
      // make sure that the columns are in required order ... no using immutable as it messes up the order
      const _aliases = aliases.toJS() as OperationColumn[];
      columns = Object.keys(list[0])
        .map<OperationColumn>((column) => {
          if (column === 'error') {
            return { id: 0, column_name: 'error', column_alias: 'Error' };
          }

          return (
            _aliases.find((alias) => alias.column_name === column) ||
            ({ column_name: column, column_alias: formatString(column) } as OperationColumn)
          );
        })
        .filter((column) => !!column); // remove undefined
    }

    return (
      <>
        <OperationDataTable
          list={fromJS(list) as unknown as List<OperationDataMap>}
          columns={columns}
          editableHeaders
        />
        {count !== null ? (
          <PaginationRow
            className="pt-3"
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

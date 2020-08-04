import { List } from 'immutable';
import React, { FunctionComponent } from 'react';
import { fetchOperationData } from '../../pages/QueryData/actions';
import { OperationDataMap } from '../../types/operations';
import { OperationDataTable } from '../OperationDataTable';
import { PaginationRow } from '../PaginationRow';

interface OperationDataTableContainerProps {
  list?: List<OperationDataMap>;
  id: string;
  limit: number;
  offset: number;
  count: number;
  fetchData: typeof fetchOperationData;
}

const getColumns = (item?: OperationDataMap): string[] => {
  if (item) {
    const columns: string[] = [];
    item.mapKeys((key: string) => columns.push(key));

    return columns;
  }

  return [];
};

export const OperationDataTableContainer: FunctionComponent<OperationDataTableContainerProps> = (
  props,
) => {
  const { fetchData, id, limit, list, count } = props;
  const columns = props.list ? getColumns(props.list.get(0)) : [];

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

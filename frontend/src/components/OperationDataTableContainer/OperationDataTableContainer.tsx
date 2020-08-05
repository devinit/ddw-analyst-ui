import { List } from 'immutable';
import * as React from 'react';
import { OperationDataMap } from '../../types/operations';
import { ColumnList } from '../../types/sources';
import { fetchOperationData } from '../../pages/QueryData/actions';
import { OperationDataTable } from '../OperationDataTable';

interface OperationDataTableContainerProps {
  list?: List<OperationDataMap>;
  columns?: ColumnList;
  id?: string;
  limit: number;
  offset: number;
  hidePaginate?: boolean | undefined;
  fetchData?: typeof fetchOperationData;
}

const getColumns = (item?: OperationDataMap): string[] => {
  if (item) {
    const columns: string[] = [];
    item.mapKeys((key: string) => columns.push(key));

    return columns;
  }

  return [];
};

export const OperationDataTableContainer: React.SFC<OperationDataTableContainerProps> = (props) => {
  const { fetchData, id, limit, offset, list, hidePaginate } = props;
  const columns = props.list ? getColumns(props.list.get(0)) : [];
  const itemId = id ? id : '';

  const goToFirst = () => (fetchData ? fetchData({ id: itemId, limit, offset: 0 }) : null);
  const goToNext = () => {
    const newOffset = offset + limit;
    if (list && list.count() >= limit) {
      fetchData ? fetchData({ id: itemId, limit, offset: newOffset }) : null;
    }
  };
  const goToPrev = () => {
    if (offset > 0) {
      const newOffset = offset - limit;
      fetchData ? fetchData({ id: itemId, limit, offset: newOffset }) : null;
    }
  };

  if (list && list.count() && props.columns) {
    return (
      <OperationDataTable
        list={list}
        prev={goToPrev}
        next={goToNext}
        first={goToFirst}
        columns={columns}
        limit={limit}
        offset={offset}
        hidePaginate={hidePaginate}
      />
    );
  }

  return <div>No results found</div>;
};

OperationDataTableContainer.defaultProps = {
  hidePaginate: true,
};

import { List } from 'immutable';
import React, { FunctionComponent } from 'react';
import { Col, Pagination, Row } from 'react-bootstrap';
import { fetchOperationData } from '../../pages/QueryData/actions';
import { OperationDataMap } from '../../types/operations';
import { ColumnList } from '../../types/sources';
import { OperationDataTable } from '../OperationDataTable';

interface OperationDataTableContainerProps {
  list?: List<OperationDataMap>;
  columns?: ColumnList;
  id?: string;
  limit: number;
  offset: number;
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

export const OperationDataTableContainer: FunctionComponent<OperationDataTableContainerProps> = (
  props,
) => {
  const { fetchData, id, limit, offset, list } = props;
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
      <>
        <OperationDataTable list={list} columns={columns} />
        <Row>
          <Col md={6}>
            Showing {offset + 1} to {list.count() < limit ? offset + list.count() : offset + limit}
          </Col>
          <Col md={6}>
            <Pagination className="float-right">
              <Pagination.First onClick={goToFirst} data-testid="operations-pagination-first">
                <i className="material-icons">first_page</i>
              </Pagination.First>
              <Pagination.Prev onClick={goToPrev} data-testid="operations-pagination-prev">
                <i className="material-icons">chevron_left</i>
              </Pagination.Prev>
              <Pagination.Next onClick={goToNext} data-testid="operations-pagination-next">
                <i className="material-icons">chevron_right</i>
              </Pagination.Next>
            </Pagination>
          </Col>
        </Row>
      </>
    );
  }

  return <div>No results found</div>;
};

OperationDataTableContainer.defaultProps = {
  limit: 10,
  offset: 0,
};

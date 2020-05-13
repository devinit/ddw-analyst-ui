import { List } from 'immutable';
import * as React from 'react';
import { Col, Pagination, Row, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { OperationDataMap } from '../../types/operations';
import { ColumnList } from '../../types/sources';
import { formatString } from '../../utils';
import { fetchOperationData } from '../../pages/QueryData/actions';

interface OperationDataTableProps {
  list?: List<OperationDataMap>;
  columns?: ColumnList;
  id: string;
  limit: number;
  offset: number;
  fetchData: typeof fetchOperationData;
}

const StyledTableHeader = styled.th`
  border-top: 1px solid #ddd !important;
`;
const getColumns = (item?: OperationDataMap): string[] => {
  if (item) {
    const columns: string[] = [];
    item.mapKeys((key: string) => columns.push(key));

    return columns;
  }

  return [];
};

const renderTableRows = (data: List<OperationDataMap>, columns: (string | number)[]) => {
  if (data && columns.length) {
    return data.map((item, key) => (
      <tr key={key}>
        {columns.map((column) => (
          <td key={column} className="text-truncate">
            {item.get(column)}
          </td>
        ))}
      </tr>
    ));
  }
};

export const OperationDataTable: React.SFC<OperationDataTableProps> = (props) => {
  const { fetchData, id, limit, offset, list } = props;
  const columns = props.list ? getColumns(props.list.get(0)) : [];
  const max = offset + limit;

  const goToFirst = () => fetchData({ id, limit, offset: 0 });
  const goToNext = () => {
    const newOffset = offset + limit;
    if (list && list.count() >= limit) {
      fetchData({ id, limit, offset: newOffset });
    }
  };
  const goToPrev = () => {
    if (offset > 0) {
      const newOffset = offset - limit;
      fetchData({ id, limit, offset: newOffset });
    }
  };

  if (list && list.count() && props.columns) {
    return (
      <React.Fragment>
        <Table bordered responsive hover striped className="operation-data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <StyledTableHeader key={column} className="text-truncate">
                  {formatString(column)}
                </StyledTableHeader>
              ))}
            </tr>
          </thead>
          <tbody>{renderTableRows(list, columns)}</tbody>
        </Table>

        <Row>
          <Col md={6}>
            Showing {offset + 1} to {list.count() < limit ? offset + list.count() : max}
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
      </React.Fragment>
    );
  }

  return <div>No results found</div>;
};

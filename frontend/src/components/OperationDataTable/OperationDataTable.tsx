import * as React from 'react';
import { Col, Pagination, Row, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { OperationDataMap } from '../../types/operations';
import { formatString } from '../../utils';
import { List } from 'immutable';
import classNames from 'classnames';

interface OperationDataTableProps {
  list: List<OperationDataMap>;
  columns: string[];
  limit: number;
  offset: number;
  hidePaginate?: boolean | undefined;
  prev: () => void;
  next: () => void;
  first: () => void;
}

const StyledTableHeader = styled.th`
  border-top: 1px solid #ddd !important;
`;

const renderTableRows = (data: List<OperationDataMap>, columns: (string | number)[]) => {
  if (data && columns.length) {
    return data.map((item, key) => (
      <tr key={key}>
        {columns.map((column) => (
          <td key={column} className="text-truncate">
            {item.get(column)?.toString()}
          </td>
        ))}
      </tr>
    ));
  }
};

export const OperationDataTable: React.SFC<OperationDataTableProps> = (props) => {
  const { limit, offset, list, prev, next, first, hidePaginate } = props;
  const columns = props.columns ? props.columns : [];
  const max = offset + limit;

  if (list && list.count && props.columns) {
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
          <Col md={6} className={classNames({ 'd-none': hidePaginate })}>
            <Pagination className="float-right">
              <Pagination.First onClick={first} data-testid="operations-pagination-first">
                <i className="material-icons">first_page</i>
              </Pagination.First>
              <Pagination.Prev onClick={prev} data-testid="operations-pagination-prev">
                <i className="material-icons">chevron_left</i>
              </Pagination.Prev>
              <Pagination.Next onClick={next} data-testid="operations-pagination-next">
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

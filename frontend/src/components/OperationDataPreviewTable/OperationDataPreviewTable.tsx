import * as React from 'react';
import { Col, Row, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { OperationData } from '../../types/operations';
import { ColumnList } from '../../types/sources';
import { formatString } from '../../utils';

interface OperationDataTableProps {
  list?: OperationData[];
  columns?: ColumnList;
  limit: number;
  offset: number;
}

const StyledTableHeader = styled.th`
  border-top: 1px solid #ddd !important;
`;
const getColumns = (item?: OperationData): string[] => {
  if (item) {
    const columns: string[] = [];
    const keys = Object.keys(item);
    keys.forEach((key: string) => columns.push(key));

    return columns;
  }

  return [];
};

const renderTableRows = (data: OperationData[], columns: (string | number)[]) => {
  if (data.length && columns.length) {
    return data.map((item, key) => (
      <tr key={key}>
        {columns.map((column) => (
          <td key={column} className="text-truncate">
            {item[column]}
          </td>
        ))}
      </tr>
    ));
  }
};

export const OperationDataPreviewTable: React.SFC<OperationDataTableProps> = (props) => {
  const { limit, offset, list } = props;
  const columns = props.list ? getColumns(props.list[0]) : [];
  const max = offset + limit;

  if (list && list.length && props.columns) {
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
            Showing {offset + 1} to {list.length < limit ? offset + list.length : max}
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  return <div>No results found</div>;
};

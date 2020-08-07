import { List } from 'immutable';
import * as React from 'react';
import { Table } from 'react-bootstrap';
import styled from 'styled-components';
import { OperationDataMap } from '../../types/operations';
import { formatString } from '../../utils';

interface OperationDataTableProps {
  list: List<OperationDataMap>;
  columns: string[];
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

export const OperationDataTable: React.SFC<OperationDataTableProps> = ({ list, columns }) => (
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
);

OperationDataTable.defaultProps = { columns: [] };

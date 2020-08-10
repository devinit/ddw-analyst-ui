import { List } from 'immutable';
import * as React from 'react';
import { Table } from 'react-bootstrap';
import styled from 'styled-components';
import { OperationDataMap } from '../../types/operations';
import { OperationColumn } from '../../types/sources';
import { formatString } from '../../utils';

interface OperationDataTableProps {
  list: List<OperationDataMap>;
  columns: OperationColumn[];
}

const StyledTableHeader = styled.th`
  border-top: 1px solid #ddd !important;
`;

const renderTableRows = (data: List<OperationDataMap>, columns: OperationColumn[]) => {
  if (data && columns.length) {
    return data.map((item, key) => (
      <tr key={key}>
        {columns.map((column) => (
          <td key={column.column_name} className="text-truncate">
            {item.get(column.column_alias)?.toString()}
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
          <StyledTableHeader key={column.column_name} className="text-truncate">
            {formatString(column.column_alias)}
          </StyledTableHeader>
        ))}
      </tr>
    </thead>
    <tbody>{renderTableRows(list, columns)}</tbody>
  </Table>
);

OperationDataTable.defaultProps = { columns: [] };

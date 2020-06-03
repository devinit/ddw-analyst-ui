import React, { FunctionComponent } from 'react';
import { Card, Table } from 'react-bootstrap';
import { ColumnList } from '../../types/sources';
import { Column } from '../FileInput';
import { CSVMappingTableRow } from './CSVMappingTableRow';
import { getDefaultColumnMapping } from './utils';

interface ComponentProps {
  columns: Column[];
  dataSourceColumns: ColumnList;
}

const CSVMappingTable: FunctionComponent<ComponentProps> = ({ columns, dataSourceColumns }) => {
  const unmatchedCount = columns.filter((column) => !column.dataSourceProperty).length;
  console.log(getDefaultColumnMapping(columns, dataSourceColumns));

  return (
    <Card className="card-plain mt-0 mb-0">
      <Card.Header className="pl-2">
        {unmatchedCount ? (
          <Card.Text className="text-capitalize h6">
            You have <span className="text-danger">{unmatchedCount}</span> unmatched columns
          </Card.Text>
        ) : null}
      </Card.Header>
      <Card.Body className="table-full-width">
        <Table responsive className="overflow-visible">
          <thead>
            <tr>
              <th>Matched</th>
              <th>Column Header From File</th>
              <th>Data Source Property</th>
            </tr>
          </thead>

          <tbody>
            {columns.map((column) => (
              <CSVMappingTableRow
                key={column.name}
                column={column}
                dataSourceColumns={dataSourceColumns}
              />
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export { CSVMappingTable };

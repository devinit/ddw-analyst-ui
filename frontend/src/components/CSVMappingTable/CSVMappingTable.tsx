import React, { FunctionComponent } from 'react';
import { Card, Table } from 'react-bootstrap';
import { Column } from '../FileInput';
import { CSVMappingTableRow } from './CSVMappingTableRow';

interface ComponentProps {
  columns: Column[];
}

const CSVMappingTable: FunctionComponent<ComponentProps> = ({ columns }) => {
  const unmatchedCount = columns.filter((column) => !column.dataSourceProperty).length;

  return (
    <Card className="card-plain mt-0 mb-0">
      <Card.Header className="pl-2">
        {unmatchedCount ? (
          <Card.Text>
            <h6 className="text-capitalize">
              You have <span className="text-danger">{unmatchedCount}</span> unmatched columns
            </h6>
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
              <CSVMappingTableRow key={column.name} column={column} />
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export { CSVMappingTable };

import React, { FunctionComponent, useContext, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
import { WizardContext } from '../../pages/DataUpdate';
import { CSVMappingTableRow } from './CSVMappingTableRow';
import { getDefaultColumnMapping } from './utils';

const CSVMappingTable: FunctionComponent = () => {
  const { data, table, updateData } = useContext(WizardContext);
  useEffect(() => {
    if (data?.columns && table && updateData) {
      const updatedColumns = getDefaultColumnMapping(data.columns, table.columns);
      const updatedData = { ...data };
      updatedData.columns = updatedColumns;
      updateData(updatedData);
    }
  }, []);

  if (!data?.columns || !table?.columns) {
    return <div>Missing vital data</div>;
  }

  const { columns } = data;
  const tableColumns = table.columns;

  const unmatchedCount = columns.filter((column) => !column.tableProperty).length;

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
              <CSVMappingTableRow key={column.name} column={column} tableColumns={tableColumns} />
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export { CSVMappingTable };

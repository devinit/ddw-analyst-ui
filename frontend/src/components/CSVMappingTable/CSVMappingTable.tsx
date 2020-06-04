import React, { FunctionComponent, useContext, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
import { WizardContext } from '../../pages/DataUpdate/DataUpdate';
import { ColumnList } from '../../types/sources';
import { CSVMappingTableRow } from './CSVMappingTableRow';
import { getDefaultColumnMapping } from './utils';

const CSVMappingTable: FunctionComponent = () => {
  const { data, dataSource, updateData } = useContext(WizardContext);
  useEffect(() => {
    if (data?.columns && dataSource && updateData) {
      const updatedColumns = getDefaultColumnMapping(
        data.columns,
        dataSource.get('columns') as ColumnList,
      );
      const updatedData = { ...data };
      updatedData.columns = updatedColumns;
      updateData(updatedData);
    }
  }, []);

  if (!data?.columns || !dataSource?.get('columns')) {
    return <div>Missing vital data</div>;
  }

  const { columns } = data;
  const dataSourceColumns = dataSource.get('columns') as ColumnList;

  const unmatchedCount = columns.filter((column) => !column.dataSourceProperty).length;

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

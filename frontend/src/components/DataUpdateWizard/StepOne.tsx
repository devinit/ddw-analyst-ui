import React, { FunctionComponent, useState } from 'react';
import { Alert, Col, Row, Table } from 'react-bootstrap';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { getUpdatableTableSelectOptions, UpdateTable, UPDATABLE_TABLES, api } from '../../utils';

interface ComponentProps {
  onComplete?: (table: UpdateTable) => void;
}

const StepOne: FunctionComponent<ComponentProps> = ({ onComplete }) => {
  const [selectedTable, setSelectedTable] = useState<UpdateTable | undefined>();
  const onChange = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ): void => {
    if (onComplete) {
      const selectedTable = UPDATABLE_TABLES.find((table) => table.name === (data.value as string));
      if (selectedTable) {
        setSelectedTable(selectedTable);
        onComplete(selectedTable);
      }
    }
  };

  return (
    <>
      <h5 className="info-text">Select the data source you wish to update</h5>
      <Alert variant="dark" className="alert-with-icon">
        <i className="text-info material-icons" data-notify="icon">
          info
        </i>
        These are predetermined as not all data sources are open to being updated via this
        interface.
      </Alert>
      <Row>
        <Col sm={4}>
          <Dropdown
            className="btn btn-danger text-capitalize"
            placeholder="Select Data Source"
            fluid
            search
            selection
            options={getUpdatableTableSelectOptions()}
            onChange={onChange}
          />
        </Col>
      </Row>
      {selectedTable ? (
        <div>
          <a
            className="btn btn-default btn-sm"
            target="_blank"
            rel="noopener noreferrer"
            href={`${api.routes.DOWNLOAD_TABLE}${selectedTable.name}/`}
          >
            Download Current Data
          </a>
          <Alert variant="dark" className="alert-with-icon">
            <i className="text-warning material-icons" data-notify="icon">
              warning
            </i>
            <p>
              The <strong>{selectedTable.caption}</strong> table requires the columns in the table
              below. Rows with missing data for those columns shall be ignored during the update
            </p>
            <p>
              <strong>NB:</strong> Your CSV column names DO NOT need to match those in the table
              below. Mapping shall be done on step 3
            </p>
          </Alert>
          <Row>
            <Col md={6} sm={12}>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Data Type</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTable.columns.map((column) => (
                    <tr key={column.name}>
                      <td>{column.caption}</td>
                      <td className="text-capitalize">{column.type}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </div>
      ) : null}
    </>
  );
};

export { StepOne };

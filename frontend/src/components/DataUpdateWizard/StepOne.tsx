import React, { FunctionComponent } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { getUpdatableTableSelectOptions, UpdateTable, UPDATABLE_TABLES } from '../../utils';

interface ComponentProps {
  onComplete?: (table: UpdateTable) => void;
}

const StepOne: FunctionComponent<ComponentProps> = ({ onComplete }) => {
  const onChange = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ): void => {
    if (onComplete) {
      const selectedTable = UPDATABLE_TABLES.find((table) => table.name === (data.value as string));
      if (selectedTable) {
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
    </>
  );
};

export { StepOne };

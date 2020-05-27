import React, { FunctionComponent } from 'react';
import { Alert, Row, Col } from 'react-bootstrap';
import { Dropdown, DropdownItemProps } from 'semantic-ui-react';

const options: DropdownItemProps[] = [
  { key: 'fts-donor-codes', text: 'FTS Donor Codes', value: 'fts-donor-codes' },
  { key: 'fts-deflators', text: 'FTS Deflators', value: 'fts-deflators' },
];

const StepOne: FunctionComponent = () => {
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
            selection
            options={options}
          />
        </Col>
      </Row>
    </>
  );
};

export { StepOne };

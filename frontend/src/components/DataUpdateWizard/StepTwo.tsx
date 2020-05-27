import React, { FunctionComponent } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';

const StepTwo: FunctionComponent = () => {
  return (
    <>
      <h5 className="info-text">Upload a CSV or Excel file from your computer</h5>
      <Alert variant="dark" className="alert-with-icon">
        <i className="text-info material-icons" data-notify="icon">
          info
        </i>
        The file must include the first row as the header row
      </Alert>
      <Row>
        <Col sm={4}>Content Goes Here</Col>
      </Row>
    </>
  );
};

export { StepTwo };

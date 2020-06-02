import React, { FunctionComponent } from 'react';
import { Alert } from 'react-bootstrap';

const StepThree: FunctionComponent = () => {
  return (
    <>
      <h5 className="info-text"> Map columns on the XLS/CSV to data source properties</h5>
      <Alert variant="dark" className="alert-with-icon">
        <i className="text-info material-icons" data-notify="icon">
          info
        </i>
        <p>
          Each column header below should be mapped to a data source property. Some of these have
          already been mapped based on their names. Anything that has not been mapped yet can be
          manually mapped to a property with the dropdown menu.
        </p>
      </Alert>
    </>
  );
};

export { StepThree };

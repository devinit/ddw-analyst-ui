import React, { FunctionComponent } from 'react';
import { Alert } from 'react-bootstrap';

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
    </>
  );
};

export { StepOne };

import React, { FunctionComponent, useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

type Status = 'uploading' | 'successful' | 'failed';
const StepFour: FunctionComponent = () => {
  const [status, setStatus] = useState<Status>('uploading');
  useEffect(() => {
    if (status !== 'uploading') {
      setStatus('uploading');
    }
  }, []);

  if (status === 'uploading') {
    return (
      <Alert variant="dark" className="alert-with-icon">
        <i className="text-info material-icons" data-notify="icon">
          info
        </i>
        Uploading ... please wait
      </Alert>
    );
  }

  if (status === 'failed') {
    return (
      <Alert variant="danger" className="alert-with-icon">
        <i className="text-error material-icons" data-notify="icon">
          error
        </i>
        Upload failed - [Insert Reason Here]
      </Alert>
    );
  }

  return (
    <Alert variant="success" className="alert-with-icon">
      <i className="text-success material-icons" data-notify="icon">
        check
      </i>
      Upload successful
    </Alert>
  );
};

export { StepFour };

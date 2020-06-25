import React, { FunctionComponent, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-bootstrap';
import { WizardContext } from '../../pages/DataUpdate';
import { updateTable } from '../../utils';

type Status = 'uploading' | 'successful' | 'failed';
const StepFour: FunctionComponent = () => {
  const { table, data } = useContext(WizardContext);
  const [status, setStatus] = useState<Status>('uploading');
  const [alertMessage, setAlertMessage] = useState('');
  useEffect(() => {
    if (status !== 'uploading') {
      setStatus('uploading');
    }
    if (table && data) {
      updateTable(table, data).then((response) => {
        if (response.error) {
          setStatus('failed');
          setAlertMessage(response.error.message);
        } else {
          setStatus('successful');
        }
      });
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
        Upload failed - {alertMessage}
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

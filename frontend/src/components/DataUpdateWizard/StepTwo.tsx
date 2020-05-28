import React, { FunctionComponent, useContext, ChangeEvent, useState } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { WizardContext } from '../../pages/DataUpdate/DataUpdate';
import { FileInput, convertCSVFileToJSON, CSVData } from '../FileInput';
import { CSVPreviewTable } from '../CSVPreviewTable';

const StepTwo: FunctionComponent = () => {
  const wizardData = useContext(WizardContext);
  console.log(wizardData); // TODO: remove this when done
  const [data, setData] = useState<CSVData | undefined>();

  const onChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>): void => {
    if (currentTarget.files && currentTarget.files.length) {
      convertCSVFileToJSON(currentTarget.files[0]).then((data) => setData(data));
    }
  };

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
        <Col sm={4}>
          <FileInput accept=".csv" onChange={onChange} />
        </Col>
      </Row>

      {data ? <CSVPreviewTable columns={data.columns} data={data.data} /> : null}
    </>
  );
};

export { StepTwo };

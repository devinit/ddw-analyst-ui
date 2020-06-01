import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { CSVPreviewTable } from '../CSVPreviewTable';
import { convertCSVFileToJSON, CSVData, FileInput } from '../FileInput';

const StepTwo: FunctionComponent = () => {
  const [data, setData] = useState<CSVData | undefined>();

  const onChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>): void => {
    if (currentTarget.files && currentTarget.files.length) {
      convertCSVFileToJSON(currentTarget.files[0]).then((data) => setData(data));
    }
  };
  const onRemove = (): void => setData(undefined);

  return (
    <>
      <h5 className="info-text">Upload a CSV file from your computer</h5>
      <Alert variant="dark" className="alert-with-icon">
        <i className="text-info material-icons" data-notify="icon">
          info
        </i>
        The file must include the first row as the header row
      </Alert>
      <Row>
        <Col sm={4}>
          <FileInput accept=".csv" onChange={onChange} onReset={onRemove} label="Select CSV" />
        </Col>
      </Row>

      {data ? <CSVPreviewTable columns={data.columns} data={data.data} /> : null}
    </>
  );
};

export { StepTwo };

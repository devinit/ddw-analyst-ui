import React, { ChangeEvent, FunctionComponent, useContext, useEffect, useState } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { WizardContext } from '../../pages/DataUpdate/DataUpdate';
import { CSVPreviewTable } from '../CSVPreviewTable';
import { convertCSVFileToJSON, CSVData, FileInput } from '../FileInput';

interface ComponentProps {
  onComplete: (data: CSVData) => void;
  onRemove: () => void;
}

const StepTwo: FunctionComponent<ComponentProps> = ({ onComplete, onRemove }) => {
  const { data: _data } = useContext(WizardContext);
  const [data, setData] = useState<CSVData | undefined>(_data);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (data) {
      onComplete(data);
    } else {
      onRemove();
    }
  }, [data]);

  const onChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>): void => {
    if (currentTarget.files && currentTarget.files.length) {
      setIsProcessing(true);
      convertCSVFileToJSON(currentTarget.files[0]).then((data) => {
        setData(data);
        setIsProcessing(false);
      });
    }
  };
  const onRemoveFile = (): void => setData(undefined);

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
          <FileInput
            isProcessing={isProcessing}
            accept=".csv"
            onChange={onChange}
            onReset={onRemoveFile}
            label="Select CSV"
          />
        </Col>
      </Row>

      {data ? <CSVPreviewTable columns={data.columns} data={data.data} /> : null}
    </>
  );
};

export { StepTwo };

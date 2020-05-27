import React, { FunctionComponent, useState, createContext } from 'react';
import { Card, Col } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { StepOne, StepTwo } from '../../components/DataUpdateWizard';
import {
  Wizard,
  WizardBody,
  WizardBodyContent,
  WizardHeader,
  WizardStep,
} from '../../components/Wizard';

interface WizardData {
  dataSource?: string;
}

const steps: WizardStep[] = [
  {
    key: 'one',
    caption: 'Select Data Source',
    active: true,
    disabled: true,
  },
  {
    key: 'two',
    caption: 'Select XLS/CSV',
    disabled: true,
  },
];
export const WizardContext = createContext<WizardData>({});

const DataUpdate: FunctionComponent<RouteComponentProps> = () => {
  const [showNext, setShowNext] = useState(false);
  const [dataSource, setDataSource] = useState('');
  const onNext = (_step: WizardStep): void => {
    setShowNext(true);
  };

  const onStepOneComplete = (_dataSource: string): void => {
    setDataSource(_dataSource);
    setShowNext(true);
  };

  return (
    <Col md={10} className="ml-auto mr-auto">
      <WizardContext.Provider value={{ dataSource }}>
        <Wizard
          steps={steps}
          id="data-update"
          defaultActiveKey="one"
          onNext={onNext}
          showNext={showNext}
        >
          <WizardHeader>
            <Card.Title>Update Table</Card.Title>
            <h5 className="card-description">Upload the contents of an XLS/CSV to a data table</h5>
          </WizardHeader>
          <WizardBody>
            <WizardBodyContent eventKey="one">
              <StepOne onComplete={onStepOneComplete} />
            </WizardBodyContent>
            <WizardBodyContent eventKey="two">
              <StepTwo />
            </WizardBodyContent>
          </WizardBody>
        </Wizard>
      </WizardContext.Provider>
    </Col>
  );
};

export { DataUpdate, DataUpdate as default };

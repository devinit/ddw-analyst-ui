import React, { FunctionComponent, useState } from 'react';
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

const steps: WizardStep[] = [
  {
    key: 'one',
    caption: 'Select Data Source',
    active: true,
  },
  {
    key: 'two',
    caption: 'Select XLS/CSV',
  },
];

const DataUpdate: FunctionComponent<RouteComponentProps> = () => {
  const [showNext, setShowNext] = useState(false);
  const onNext = (step: WizardStep): void => {
    console.log(step.caption);
    setShowNext(true);
  };

  return (
    <Col md={10} className="ml-auto mr-auto">
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
            <StepOne />
          </WizardBodyContent>
          <WizardBodyContent eventKey="two">
            <StepTwo />
          </WizardBodyContent>
        </WizardBody>
      </Wizard>
    </Col>
  );
};

export { DataUpdate, DataUpdate as default };

import React, { FunctionComponent } from 'react';
import { Card, Col } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { StepOne } from '../../components/DataUpdateWizard';
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
];

const DataUpdate: FunctionComponent<RouteComponentProps> = () => {
  return (
    <Col md={10} className="ml-auto mr-auto">
      <Wizard steps={steps} id="data-update" defaultActiveKey="one">
        <WizardHeader>
          <Card.Title>Update Table</Card.Title>
          <h5 className="card-description">Upload the contents of an XLS/CSV to a data table</h5>
        </WizardHeader>
        <WizardBody>
          <WizardBodyContent eventKey="one">
            <StepOne />
          </WizardBodyContent>
        </WizardBody>
      </Wizard>
    </Col>
  );
};

export { DataUpdate, DataUpdate as default };

import React, { FunctionComponent } from 'react';
import { Col, Card } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import {
  WizardStep,
  Wizard,
  WizardHeader,
  WizardBody,
  WizardBodyContent,
} from '../../components/Wizard';
import { StepOne } from '../../components/DataUpdateWizard';

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

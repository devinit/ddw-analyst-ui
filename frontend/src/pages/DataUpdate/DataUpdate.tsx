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
  StepButtonStatus,
} from '../../components/Wizard';

interface WizardData {
  dataSource?: string;
}

const defaultSteps: WizardStep[] = [
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
const updateSteps = (steps: WizardStep[], activeIndex: number): WizardStep[] => {
  const nextIndex = activeIndex + 1;

  if (nextIndex >= steps.length) {
    return steps;
  }

  steps[activeIndex].active = false;
  steps[nextIndex].active = true;

  return steps.slice();
};

const DataUpdate: FunctionComponent<RouteComponentProps> = () => {
  const [steps, setSteps] = useState<WizardStep[]>(defaultSteps);
  const [nextButtonStatus, setNextButtonStatus] = useState<StepButtonStatus>('disabled');
  const [dataSource, setDataSource] = useState('');
  const onNext = (step: WizardStep): void => {
    setSteps(
      updateSteps(
        steps,
        steps.findIndex((_step) => _step.key === step.key),
      ),
    );
    setNextButtonStatus('disabled');
  };

  const onStepOneComplete = (_dataSource: string): void => {
    setDataSource(_dataSource);
    setNextButtonStatus('enabled');
  };
  const activeStep = steps.find((step) => step.active);

  return (
    <Col md={10} className="ml-auto mr-auto">
      <WizardContext.Provider value={{ dataSource }}>
        <Wizard
          steps={steps}
          id="data-update"
          defaultActiveKey="one"
          onNext={onNext}
          nextButtonStatus={nextButtonStatus}
        >
          <WizardHeader>
            <Card.Title>Update Table</Card.Title>
            <h5 className="card-description">Upload the contents of an XLS/CSV to a data table</h5>
          </WizardHeader>
          <WizardBody>
            <WizardBodyContent eventKey="one" active={activeStep && activeStep.key === 'one'}>
              <StepOne onComplete={onStepOneComplete} />
            </WizardBodyContent>
            <WizardBodyContent eventKey="two" active={activeStep && activeStep.key === 'two'}>
              <StepTwo />
            </WizardBodyContent>
          </WizardBody>
        </Wizard>
      </WizardContext.Provider>
    </Col>
  );
};

export { DataUpdate, DataUpdate as default };

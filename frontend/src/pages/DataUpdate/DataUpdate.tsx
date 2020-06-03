import React, { createContext, FunctionComponent, useContext, useState } from 'react';
import { Card, Col } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { StepOne, StepThree, StepTwo } from '../../components/DataUpdateWizard';
import { CSVData } from '../../components/FileInput';
import {
  StepButtonStatus,
  Wizard,
  WizardBody,
  WizardBodyContent,
  WizardHeader,
  WizardStep,
} from '../../components/Wizard';
import { Source } from '../../types/sources';

interface WizardData {
  dataSource?: Source;
  data?: CSVData;
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
    caption: 'Select CSV',
    disabled: true,
  },
  {
    key: 'three',
    caption: 'Map',
    disabled: true,
  },
];
export const WizardContext = createContext<WizardData>({});
const updateSteps = (
  steps: WizardStep[],
  activeIndex: number,
  direction: 'next' | 'prev' = 'next',
): WizardStep[] => {
  const nextIndex = direction === 'next' ? activeIndex + 1 : activeIndex - 1;

  if (nextIndex >= steps.length) {
    return steps;
  }

  steps[activeIndex].active = false;
  steps[nextIndex].active = true;

  return steps.slice();
};

const DataUpdate: FunctionComponent<RouteComponentProps> = () => {
  const wizardContext = useContext(WizardContext);
  const [steps, setSteps] = useState<WizardStep[]>(defaultSteps);
  const [nextButtonStatus, setNextButtonStatus] = useState<StepButtonStatus>('disabled');
  const [dataSource, setDataSource] = useState(wizardContext.dataSource);
  const [data, setData] = useState<undefined | CSVData>(wizardContext.data);
  const onNext = (step: WizardStep): void => {
    const activeIndex = steps.findIndex((_step) => _step.key === step.key);
    setSteps(updateSteps(steps, activeIndex));
    // only set step 2 button to 'disabled' if there's no data
    if (activeIndex === 0 && !data) {
      setNextButtonStatus('disabled');
    }
  };
  const onPrevious = (step: WizardStep): void => {
    setSteps(
      updateSteps(
        steps,
        steps.findIndex((_step) => _step.key === step.key),
        'prev',
      ),
    );
    setNextButtonStatus('enabled');
  };

  const onStepOneComplete = (_dataSource: Source): void => {
    setDataSource(_dataSource);
    setNextButtonStatus('enabled');
  };
  const onStepTwoComplete = (_data: CSVData): void => {
    setData(_data);
    setNextButtonStatus('enabled');
  };
  const onStepTwoReset = (): void => {
    setData(undefined);
    setNextButtonStatus('disabled');
  };
  const activeStep = steps.find((step) => step.active);

  return (
    <Col md={10} className="ml-auto mr-auto">
      <WizardContext.Provider value={{ dataSource, data }}>
        <Wizard
          steps={steps}
          id="data-update"
          defaultActiveKey="one"
          onNext={onNext}
          onPrevious={onPrevious}
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
              <StepTwo onComplete={onStepTwoComplete} onRemove={onStepTwoReset} />
            </WizardBodyContent>
            <WizardBodyContent eventKey="three" active={activeStep && activeStep.key === 'three'}>
              <StepThree />
            </WizardBodyContent>
          </WizardBody>
        </Wizard>
      </WizardContext.Provider>
    </Col>
  );
};

export { DataUpdate, DataUpdate as default };

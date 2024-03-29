import classNames from 'classnames';
import React, {
  Children,
  FunctionComponent,
  isValidElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { Button, Card, Tab, TabContainerProps } from 'react-bootstrap';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import { WizardBody, WizardFooter, WizardHeader, WizardNavigation, WizardNavigationItem } from '.';
import { showFinishButton, showNextButton, showPreviousButton } from './utils';
import { WizardMovingTab } from './WizardMovingTab';

interface WizardProps extends TabContainerProps {
  steps?: WizardStep[];
  onPrevious?: (step: WizardStep) => void;
  onNext?: (step: WizardStep) => void;
  onFinish?: (step: WizardStep) => void;
  nextButtonStatus?: StepButtonStatus;
}

export type StepButtonStatus = 'enabled' | 'disabled' | 'hidden';

export interface WizardStep {
  key: string;
  caption?: string;
  active?: boolean;
  disabled?: boolean;
  onLoad?: () => void;
  beforeNext?: () => void;
}

const StyledCard = styled(Card)`
  opacity: 1;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
`;

const Wizard: FunctionComponent<WizardProps> = ({
  children,
  steps,
  onPrevious,
  onNext,
  onFinish,
  nextButtonStatus,
  ...props
}) => {
  const [activeStep, setActiveStep] = useState(steps?.find((step) => step.active));
  const { width, ref: wizardNode } = useResizeDetector();

  useEffect(() => {
    const currentActiveStep = steps?.find((step) => step.active);
    if (currentActiveStep && currentActiveStep.key !== activeStep?.key) {
      setActiveStep(currentActiveStep);
    }
  }, [steps]);

  const onSelect = (activeKey: string): void =>
    setActiveStep(steps?.find((item) => activeKey.includes(item.key)));

  const renderWizardNavigation = (): ReactNode => {
    if (steps && steps?.length) {
      const col = Math.ceil(12 / steps.length);

      return steps.map(({ caption, key, disabled }) => (
        <WizardNavigationItem
          key={key}
          active={activeStep?.key === key}
          eventKey={key}
          className={classNames(`col-sm-6 col-lg-${col}`)}
          onSelect={onSelect}
          disabled={disabled}
        >
          {caption}
        </WizardNavigationItem>
      ));
    }

    return null;
  };

  const onBack = (): void => {
    if (onPrevious && activeStep) onPrevious(activeStep);
  };
  const onForward = (): void => {
    if (onNext && activeStep) onNext(activeStep);
  };
  const onComplete = (): void => {
    if (onFinish && activeStep) onFinish(activeStep);
  };

  return (
    <div className="wizard-container" ref={wizardNode}>
      <Tab.Container {...props}>
        <StyledCard className="card-wizard" data-color="red">
          {Children.map(children, (child) =>
            isValidElement(child) && child.type === WizardHeader ? child : null,
          )}
          <WizardNavigation>
            {renderWizardNavigation()}
            {steps && steps.length && width && activeStep ? (
              <WizardMovingTab steps={steps} wizardWidth={width} activeKey={activeStep.key}>
                {activeStep.caption}
              </WizardMovingTab>
            ) : null}
          </WizardNavigation>
          {Children.map(children, (child) =>
            isValidElement(child) && (child.type === WizardBody || child.type === WizardFooter)
              ? child
              : null,
          )}
          <WizardFooter>
            <div className="mr-auto">
              <Button
                className={classNames('btn-previous btn-fill btn-wd btn-default', {
                  'd-none': !showPreviousButton(steps, activeStep),
                })}
                onClick={onBack}
              >
                Previous
              </Button>
            </div>
            <div className="ml-auto">
              <Button
                variant="danger"
                className={classNames('btn btn-next btn-fill btn-wd', {
                  'd-none': nextButtonStatus === 'hidden' || !showNextButton(steps, activeStep),
                  disabled: nextButtonStatus === 'disabled' && showNextButton(steps, activeStep),
                })}
                onClick={onForward}
              >
                Next
              </Button>
              <Button
                variant="danger"
                className={classNames('btn btn-fill btn-wd', {
                  'd-none': !showFinishButton(steps, activeStep),
                  disabled: nextButtonStatus === 'disabled' && showFinishButton(steps, activeStep),
                })}
                name="finish"
                onClick={onComplete}
              >
                Finish
              </Button>
            </div>
            <div className="clearfix"></div>
          </WizardFooter>
        </StyledCard>
      </Tab.Container>
    </div>
  );
};

export { Wizard };

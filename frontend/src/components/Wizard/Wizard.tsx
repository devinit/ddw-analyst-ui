import classNames from 'classnames';
import React, {
  Children,
  FunctionComponent,
  isValidElement,
  ReactNode,
  useRef,
  useState,
} from 'react';
import { Card, Tab, TabContainerProps } from 'react-bootstrap';
import ReactResizeDetector from 'react-resize-detector';
import styled from 'styled-components';
import { WizardBody, WizardHeader, WizardNavigation, WizardNavigationItem } from '.';
import { WizardMovingTab } from './WizardMovingTab';

interface WizardProps extends TabContainerProps {
  steps?: WizardStep[];
}

export interface WizardStep {
  key: string;
  caption?: string;
  active?: boolean;
}

const StyledCard = styled(Card)`
  opacity: 1;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
`;

const Wizard: FunctionComponent<WizardProps> = ({ children, steps, ...props }) => {
  const [activeStep, setActiveStep] = useState(steps?.find((step) => step.active));
  const [width, setWidth] = useState(0);
  const wizardNode = useRef<null | HTMLDivElement>(null);
  const onSelect = (activeKey: string): void =>
    setActiveStep(steps?.find((item) => activeKey.includes(item.key)));

  const renderWizardNavigation = (): ReactNode => {
    if (steps && steps?.length) {
      const col = Math.ceil(12 / steps.length);

      return steps.map(({ caption, key }) => (
        <WizardNavigationItem
          key={key}
          active={activeStep?.key === key}
          eventKey={key}
          className={classNames(`col-sm-6 col-lg-${col}`)}
          onSelect={onSelect}
        >
          {caption}
        </WizardNavigationItem>
      ));
    }

    return null;
  };

  const onResize = (width: number): void => setWidth(width);

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
            isValidElement(child) && child.type === WizardBody ? child : null,
          )}
        </StyledCard>
        <ReactResizeDetector handleWidth handleHeight onResize={onResize} />
      </Tab.Container>
    </div>
  );
};

export { Wizard };

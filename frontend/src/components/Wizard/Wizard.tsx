import React, { FunctionComponent, Children, isValidElement, ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import { WizardBody, WizardHeader, WizardNavigation, WizardNavigationItem } from '.';

interface WizardProps {
  nav?: WizardNav[];
}

export interface WizardNav {
  key: string;
  caption?: string;
  active?: boolean;
}

const StyledCard = styled(Card)`
  opacity: 1;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
`;

const Wizard: FunctionComponent<WizardProps> = ({ children, nav }) => {
  const renderWizardNavigation = (): ReactNode => {
    if (nav && nav?.length) {
      const col = Math.ceil(12 / nav.length);

      return nav.map(({ active, caption, key }) => (
        <WizardNavigationItem
          key={key}
          active={active}
          eventKey={`#${key}`}
          className={`col-${col}`}
        >
          {caption}
        </WizardNavigationItem>
      ));
    }

    return null;
  };

  return (
    <div className="wizard-container">
      <StyledCard className="card-wizard" data-color="red">
        {Children.map(children, (child) =>
          isValidElement(child) && child.type === WizardHeader ? child : null,
        )}
        <WizardNavigation>{renderWizardNavigation()}</WizardNavigation>
        {Children.map(children, (child) =>
          isValidElement(child) && child.type === WizardBody ? child : null,
        )}
      </StyledCard>
    </div>
  );
};

export { Wizard };

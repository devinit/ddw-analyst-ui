import React, { FC } from 'react';
import { Card, Tab } from 'react-bootstrap';

type ComponentProps = {
  children?: React.ReactNode;
};
const WizardBody: FC<ComponentProps> = ({ children }) => {
  return (
    <Card.Body>
      <Tab.Content>{children}</Tab.Content>
    </Card.Body>
  );
};

export { WizardBody };

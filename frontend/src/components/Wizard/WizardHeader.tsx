import React, { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

type ComponentProps = {
  children?: React.ReactNode;
};
const WizardHeader: FunctionComponent<ComponentProps> = ({ children }) => {
  return <Card.Header className="text-center">{children}</Card.Header>;
};

export { WizardHeader };

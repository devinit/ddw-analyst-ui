import React, { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

type ComponentProps = {
  children?: React.ReactNode;
};
const WizardFooter: FunctionComponent<ComponentProps> = ({ children }) => {
  return <Card.Footer>{children}</Card.Footer>;
};

export { WizardFooter };

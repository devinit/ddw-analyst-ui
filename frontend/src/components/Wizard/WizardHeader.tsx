import React, { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

const WizardHeader: FunctionComponent = ({ children }) => {
  return <Card.Header className="text-center">{children}</Card.Header>;
};

export { WizardHeader };

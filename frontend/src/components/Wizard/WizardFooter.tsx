import React, { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

const WizardFooter: FunctionComponent = ({ children }) => {
  return <Card.Footer>{children}</Card.Footer>;
};

export { WizardFooter };

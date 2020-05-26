import React, { FunctionComponent } from 'react';
import { Card, Tab } from 'react-bootstrap';

const WizardBody: FunctionComponent = ({ children }) => {
  return (
    <Card.Body>
      <Tab.Content>{children}</Tab.Content>
    </Card.Body>
  );
};

export { WizardBody };

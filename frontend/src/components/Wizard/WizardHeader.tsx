import React, { FunctionComponent } from 'react';
import { Card, Nav } from 'react-bootstrap';

const WizardHeader: FunctionComponent = ({ children }) => {
  return (
    <Card.Header>
      <Nav variant="pills">{children}</Nav>
    </Card.Header>
  );
};

export { WizardHeader };

import React, { FC } from 'react';
import { Card } from 'react-bootstrap';

type ComponentProps = {
  children?: React.ReactNode;
};
const WizardFooter: FC<ComponentProps> = ({ children }) => {
  return <Card.Footer>{children}</Card.Footer>;
};

export { WizardFooter };

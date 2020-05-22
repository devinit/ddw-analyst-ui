import React, { FunctionComponent } from 'react';
import { Nav, NavItemProps } from 'react-bootstrap';

const WizardHeaderItem: FunctionComponent<NavItemProps> = ({ children, ...props }) => {
  return <Nav.Item {...props}>{children}</Nav.Item>;
};

export { WizardHeaderItem };

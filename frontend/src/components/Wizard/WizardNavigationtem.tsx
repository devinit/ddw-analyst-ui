import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Nav, NavLinkProps } from 'react-bootstrap';

interface ComponentProps extends NavLinkProps {
  className?: string;
}

const WizardNavigationItem: FunctionComponent<ComponentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <Nav.Item as="li" className={classNames(className)}>
      <Nav.Link {...props}>{children}</Nav.Link>
    </Nav.Item>
  );
};

export { WizardNavigationItem };

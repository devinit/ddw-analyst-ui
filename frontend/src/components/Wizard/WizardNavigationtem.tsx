import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Nav, NavLinkProps } from 'react-bootstrap';
import styled from 'styled-components';

interface ComponentProps extends NavLinkProps {
  className?: string;
}

const StyledNavLink = styled(Nav.Link)`
  &.nav-link {
    display: block;
  }
`;

const WizardNavigationItem: FunctionComponent<ComponentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <Nav.Item as="li" className={classNames(className)}>
      <StyledNavLink {...props}>{children}</StyledNavLink>
      {props.active ? <div className="nav-tab-active d-lg-none d-xl-none">{children}</div> : null}
    </Nav.Item>
  );
};

export { WizardNavigationItem };

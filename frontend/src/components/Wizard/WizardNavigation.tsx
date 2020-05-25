import React, { FunctionComponent } from 'react';
import { Nav } from 'react-bootstrap';
import styled from 'styled-components';

// some strange phenomenon is happening when Navs are wrapped in a Card - a calls is added to them
const StyledNav = styled(Nav)`
  &.nav {
    border-radius: inherit !important;
    margin: inherit !important;
    padding: inherit !important;
  }
`;

const WizardNavigation: FunctionComponent = ({ children }) => {
  return (
    <div className="wizard-navigation">
      <StyledNav variant="pills" className="">
        {children}
      </StyledNav>
    </div>
  );
};

export { WizardNavigation };

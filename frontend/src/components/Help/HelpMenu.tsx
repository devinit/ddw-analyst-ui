import React, { Fragment, FunctionComponent } from 'react';
import { Dropdown, NavLink } from 'react-bootstrap';
import styled from 'styled-components';
import { MenuLink } from '../../types/help';

const StyledDropdownItem = styled(Dropdown.Item)`
  text-transform: capitalize !important;

  &.disabled {
    opacity: 0.6;
  }
  &:hover,
  &:active {
    color: #ffffff !important;
  }
`;

type HelpMenuProps = {
  links: MenuLink[];
};

const HelpMenu: FunctionComponent<HelpMenuProps> = ({ links }) => {
  return (
    <>
      {links.map((link) => (
        <Fragment key={link.caption.split(' ').join('').toLowerCase()}>
          <StyledDropdownItem as={NavLink} href={link.url} target="_blank" disabled={link.disabled}>
            {link.caption}
          </StyledDropdownItem>
          {link.addDividerAfter ? <Dropdown.Divider /> : null}
        </Fragment>
      ))}
    </>
  );
};

export { HelpMenu };

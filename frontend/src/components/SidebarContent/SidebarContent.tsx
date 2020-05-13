import classNames from 'classnames';
import * as React from 'react';
import { SidebarItem, SidebarItemProps } from '../SidebarItem';

interface SidebarContentProps {
  mobile?: boolean;
}

export class SidebarContent extends React.Component<SidebarContentProps> {
  static Item = SidebarItem;

  render() {
    return (
      <ul className={classNames('nav', { 'navbar-nav nav-mobile-menu': this.props.mobile })}>
        {React.Children.map(this.props.children, (child) => {
          if (React.isValidElement<SidebarItemProps>(child) && child.type === SidebarItem) {
            return child;
          }
        })}
      </ul>
    );
  }
}

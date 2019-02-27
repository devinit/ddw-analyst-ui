import * as React from 'react';
import { SidebarLink, SidebarLinkProps } from '../SidebarLink';
import classNames = require('classnames');

export interface SidebarItemProps {
  to: string;
  active?: boolean;
}

export class SidebarItem extends React.Component<SidebarItemProps> {
  static Link = SidebarLink;

  render() {
    return (
      <li className={ classNames('nav-item', { active: this.props.active }) }>
        { this.renderRoot() }
        { this.renderLinks() }
      </li>
    );
  }

  private renderRoot(): React.ReactNode {
    if (React.Children.count(this.props.children) > 1) {
      const rootLink = React.Children.map(this.props.children, child => {
        if (React.isValidElement<SidebarLinkProps>(child) && child.type === SidebarLink && child.props.root) {
          return child;
        }
      })[0];

      if (rootLink) {
        return React.cloneElement(rootLink, { to: this.props.to });
      }

      console.error('A root link is required in a sidebar item with more than one child'); // tslint:disable-line
    }

    return React.Children.map(this.props.children, child => {
      if (React.isValidElement<SidebarLinkProps>(child) && child.type === SidebarLink && child.props.root) {
        return React.cloneElement(child, { single: true });
      }
    });
  }

  private renderLinks(): React.ReactNode {
    if (React.Children.count(this.props.children) > 1) {
      return (
        <div className="collapse" id={ this.props.to }>
          <ul className="nav">
            {
              React.Children.map(this.props.children, child => {
                if (React.isValidElement<SidebarItemProps>(child) && child.type === SidebarItem) {
                  return child;
                }
              })
            }
          </ul>
        </div>
      );
    }

    return React.Children.map(this.props.children, child => {
      if (React.isValidElement<SidebarLinkProps>(child) && child.type === SidebarLink && !child.props.root) {
        return child;
      }
    });
  }
}

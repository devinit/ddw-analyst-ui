import * as React from 'react';
import { Route } from 'react-router-dom';
import { SidebarItem, SidebarItemProps } from '../SidebarItem';

export class SidebarContent extends React.Component {
  static Item = SidebarItem;

  render() {
    return (
      <Route>
        <div className="sidebar-wrapper">
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
      </Route>
    );
  }
}

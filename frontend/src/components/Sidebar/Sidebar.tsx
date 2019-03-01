import * as React from 'react';
import { SidebarContent } from '../SidebarContent';
import { SidebarItem } from '../SidebarItem';
import { SidebarLink } from '../SidebarLink';
import { SidebarLogo } from '../SidebarLogo';

interface SidebarProps {
  dataColour?: 'rose' | 'purple' | 'azure' | 'danger' | 'green' | 'orange';
  backgroundColour?: 'black' | 'white' | 'red';
}

export class Sidebar extends React.Component<SidebarProps> {
  static defaultProps: Partial<SidebarProps> = {
    dataColour: 'rose',
    backgroundColour: 'black'
  };
  static Logo = SidebarLogo;
  static Content = SidebarContent;
  static Item = SidebarItem;
  static Link = SidebarLink;

  render() {
    return (
      <div
        className="sidebar"
        data-color={ this.props.dataColour }
        data-background-color={ this.props.backgroundColour }
      >
        { this.renderContent(SidebarLogo) }
        { this.renderContent(SidebarContent) }
      </div>
    );
  }

  private renderContent(type: typeof SidebarLogo | typeof SidebarContent) {
    return React.Children.map(this.props.children, child => {
      if (React.isValidElement(child) && child.type === type) {
        return child;
      }
    });
  }
}

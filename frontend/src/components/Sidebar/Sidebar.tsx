import * as React from 'react';
import { SidebarContent } from '../SidebarContent';
import { SidebarItem } from '../SidebarItem';
import { SidebarLink } from '../SidebarLink';
import { SidebarLogo } from '../SidebarLogo';
import { SidebarFooter } from '../SidebarFooter';

interface SidebarProps {
  dataColour?: 'rose' | 'purple' | 'azure' | 'danger' | 'green' | 'orange';
  backgroundColour?: 'black' | 'white' | 'red';
  children?: React.ReactNode;
}

export class Sidebar extends React.Component<SidebarProps> {
  static defaultProps: Partial<SidebarProps> = {
    dataColour: 'rose',
    backgroundColour: 'black',
  };
  static Logo = SidebarLogo;
  static Content = SidebarContent;
  static Item = SidebarItem;
  static Link = SidebarLink;
  static Footer = SidebarFooter;

  render() {
    return (
      <div
        className="sidebar"
        data-color={this.props.dataColour}
        data-background-color={this.props.backgroundColour}
      >
        {this.renderContent(SidebarLogo)}
        <div className="sidebar-wrapper">{this.renderContent(SidebarContent)}</div>
        {this.renderContent(SidebarFooter)}
      </div>
    );
  }

  private renderContent(type: typeof SidebarLogo | typeof SidebarContent | typeof SidebarFooter) {
    return React.Children.map(this.props.children, (child) => {
      if (React.isValidElement(child) && child.type === type) {
        return child;
      }
    });
  }
}

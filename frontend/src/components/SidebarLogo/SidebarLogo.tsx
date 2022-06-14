import { LocationDescriptor } from 'history';
import * as React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  url: LocationDescriptor;
  variation?: 'mini' | 'normal';
  children?: React.ReactNode;
}
type SidebarLogoProps = {
  children?: React.ReactNode;
};

export const Logo: React.FC<LogoProps> = (props) => {
  return (
    <Link to={props.url} className={`simple-text logo-${props.variation}`}>
      {props.children}
    </Link>
  );
};

Logo.defaultProps = {
  variation: 'normal',
};

Logo.displayName = 'Logo';

export class SidebarLogo extends React.Component<SidebarLogoProps> {
  static Item = Logo;

  render(): React.ReactNode {
    return <div className="logo">{this.renderContent()}</div>;
  }

  private renderContent(): React.ReactNode {
    return React.Children.map(this.props.children, (child) => {
      if (React.isValidElement(child) && child.type === Logo) {
        return child;
      }
    });
  }
}

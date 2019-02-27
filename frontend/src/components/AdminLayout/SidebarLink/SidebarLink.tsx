import * as React from 'react';
import { Link } from 'react-router-dom';
import { LocationDescriptor } from 'history';

export interface SidebarLinkProps {
  icon?: string;
  to: LocationDescriptor;
  root?: boolean;
  textMini?: string;
  textNormal?: string;
  single?: boolean;
}

export class SidebarLink extends React.Component<SidebarLinkProps> {
  static defaultProps: Partial<SidebarLinkProps> = {
    single: false
  };

  render() {
    if (this.props.root && typeof this.props.to === 'string') {
      return (
        <a className="nav-link" data-toggle="collapse" href={ `#${this.props.to}` }>
          { this.props.icon ? <i className="material-icons">{ this.props.icon }</i> : null }
          { this.renderContent() }
        </a>
      );
    }

    return (
      <Link className="nav-link" to={ this.props.to || '' }>
        { this.props.icon ? <i className="material-icons">{ this.props.icon }</i> : null }
        { this.renderContent() }
      </Link>
    );
  }

  private renderContent() {
    if (this.props.root || this.props.single) {
      return (
        <p> { this.props.textNormal || this.props.textMini }
          { !this.props.single ? <b className="caret"/> : null }
        </p>
      );
    }

    return (
      <React.Fragment>
        <span className="sidebar-mini"> { this.props.textMini } </span>
        <span className="sidebar-normal"> { this.props.textNormal } </span>
      </React.Fragment>
    );
  }
}

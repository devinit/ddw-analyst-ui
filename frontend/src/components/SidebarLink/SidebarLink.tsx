import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

export interface SidebarLinkProps extends RouteComponentProps<{}> {
  icon?: string;
  to: string;
  root?: boolean;
  textMini?: string;
  textNormal?: string;
  single?: boolean;
}

class SidebarLink extends React.Component<SidebarLinkProps> {
  static defaultProps: Partial<SidebarLinkProps> = {
    single: false
  };

  render() {
    if (this.props.root && typeof this.props.to === 'string') {
      return (
        <a className="nav-link" data-toggle="collapse" href={ this.props.to } onClick={ this.onClick }>
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

  private onClick = () => {
    if (this.props.to.indexOf('#') === -1) {
      this.props.history.push(this.props.to);
    }
  }
}

const RouteContainer = withRouter(SidebarLink);

export { RouteContainer as SidebarLink };

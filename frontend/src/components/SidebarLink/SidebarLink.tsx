import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

export interface SidebarLinkProps extends RouteComponentProps<{}> {
  icon?: string;
  to: string;
  root?: boolean;
  textMini?: string;
  textNormal?: string;
  caret?: boolean;
  single?: boolean;
  onClick?: (to: string) => void;
  [`data-testid`]?: string;
}

class SidebarLink extends React.Component<SidebarLinkProps> {
  static defaultProps: Partial<SidebarLinkProps> = {
    caret: false
  };

  render() {
    return (
      <a
        className="nav-link"
        data-toggle={ this.props.root && !this.props.single ? 'collapse' : '' }
        href={ this.props.to }
        onClick={ this.onClick }
        data-testid={ this.props['data-testid'] }
      >
        { this.props.icon ? <i className="material-icons">{ this.props.icon }</i> : null }
        { this.renderContent() }
      </a>
    );
  }

  private renderContent() {
    if (this.props.root || this.props.single) {
      return (
        <p> { this.props.textNormal || this.props.textMini }
          { this.props.caret ? <b className="caret"/> : null }
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

  private onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    if (this.props.onClick) {
      this.props.onClick(this.props.to);
    }
    if (this.props.to.indexOf('#') === -1) {
      this.props.history.push(this.props.to);
    }
  }
}

const RouteContainer = withRouter(SidebarLink);

export { RouteContainer as SidebarLink };

import * as React from 'react';
import { Navbar } from 'react-bootstrap';
import { AdminLayoutContent } from './AdminLayoutContent';
import { Sidebar } from '../Sidebar';

interface AdminLayoutProps {
  loading: boolean;
}

export class AdminLayout extends React.Component<AdminLayoutProps> {
  static defaultProps: Partial<AdminLayoutProps> = {
    loading: true
  };
  static Content = AdminLayoutContent;

  render() {
    if (this.props.loading) {
      return <div>Loading ...</div>;
    }

    return (
      <div className="wrapper">
        { this.renderContent(Sidebar) }
        <div className="main-panel">
          { this.renderContent(Navbar) }
          <div className="content">
            <div className="container-fluid">
              { this.renderContent(AdminLayoutContent) }
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderContent(type: typeof Sidebar | typeof Navbar | typeof AdminLayoutContent) {
    return React.Children.map(this.props.children, child => {
      if (React.isValidElement(child) && child.type === type) {
        return child;
      }
    });
  }
}

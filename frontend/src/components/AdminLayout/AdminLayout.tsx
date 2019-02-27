import * as React from 'react';
import { Sidebar } from './Sidebar';

interface AdminLayoutProps {
  loading: boolean;
}

export class AdminLayout extends React.Component<AdminLayoutProps> {
  static defaultProps: Partial<AdminLayoutProps> = {
    loading: true
  };

  render() {
    if (this.props.loading) {
      return <div>Loading ...</div>;
    }

    return (
      <div className="wrapper">
        { this.renderContent(Sidebar) }
        <div className="main-panel">
          <div className="content">
            <div className="container-fluid">
              Main Layout
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderContent(type: typeof Sidebar) {
    return React.Children.map(this.props.children, child => {
      if (React.isValidElement(child) && child.type === type) {
        return child;
      }
    });
  }
}

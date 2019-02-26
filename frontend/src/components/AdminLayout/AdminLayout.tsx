import * as React from 'react';
import { verifyAuthentication } from '../../utils';
import { RouteComponentProps } from 'react-router-dom';

interface AdminLayoutProps extends RouteComponentProps<{}> {
  loading: boolean;
}

interface AdminLayoutState {
  loading: boolean;
}

export class AdminLayout extends React.Component<AdminLayoutProps, AdminLayoutState> {
  static defaultProps: Partial<AdminLayoutProps> = {
    loading: true
  };
  state: AdminLayoutState = {
    loading: this.props.loading
  };

  render() {
    if (this.state.loading) {
      return <div>Loading ...</div>;
    }

    return (
      <div>
        Main Layout
      </div>
    );
  }

  componentDidMount() {
    verifyAuthentication()
      .then(() => this.setState({ loading: false }))
      .catch(() => this.props.history.push('/login'));
  }
}

import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { verifyAuthentication } from '../../utils';
import { Sidebar } from '../../components/AdminLayout/Sidebar';

interface HomeProps extends RouteComponentProps<{}> {
  loading: boolean;
}

interface HomeState {
  loading: boolean;
}

export class Home extends React.Component<HomeProps, HomeState> {
  static defaultProps: Partial<HomeProps> = {
    loading: true
  };
  state: HomeState = {
    loading: this.props.loading
  };

  render() {
    if (this.state.loading) {
      return <div>Loading ...</div>;
    }

    return (
      <AdminLayout loading={ this.state.loading }>
        <Sidebar dataColour="danger" backgroundColour="red">

          <Sidebar.Logo>
            <Sidebar.Logo.Item url="/" variation="mini">AI</Sidebar.Logo.Item>
            <Sidebar.Logo.Item url="/">Analyst UI</Sidebar.Logo.Item>
          </Sidebar.Logo>

          <Sidebar.Content>
            <Sidebar.Item to="home" active>
              <Sidebar.Link root icon="home" textNormal="Home"/>
            </Sidebar.Item>
          </Sidebar.Content>

        </Sidebar>
        Main Content
      </AdminLayout>
    );
  }

  componentDidMount() {
    verifyAuthentication()
      .then(() => this.setState({ loading: false }))
      .catch(() => this.props.history.push('/login'));
  }
}

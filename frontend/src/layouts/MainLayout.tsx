import axios, { AxiosResponse } from 'axios';
import * as localForage from 'localforage';
import * as React from 'react';
import { Dropdown, Nav, Navbar } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { BrowserRouter, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Segment } from 'semantic-ui-react';
import * as TokenActions from '../actions/token';
import * as UserActions from '../actions/user';
import { AdminLayout } from '../components/AdminLayout';
import { NavbarMinimise } from '../components/NavbarMinimise';
import { Sidebar } from '../components/Sidebar';
import { DataSources } from '../pages/DataSources';
import { Home } from '../pages/Home';
import { TokenState } from '../reducers/token';
import { User, UserState } from '../reducers/user';
import { ReduxStore } from '../store';
import { api, localForageKeys } from '../utils';

interface ActionProps { actions: typeof UserActions & typeof TokenActions; }
interface ComponentProps {
  loading: boolean;
}
type MainLayoutProps = ComponentProps & RouteComponentProps<{}> & ActionProps;

interface MainLayoutState {
  loading: boolean;
  activeRoute: string;
}

class MainLayout extends React.Component<MainLayoutProps, MainLayoutState> {
  static defaultProps: Partial<MainLayoutProps> = {
    loading: true
  };
  state: MainLayoutState = {
    loading: this.props.loading,
    activeRoute: this.props.location.pathname
  };

  render() {
    if (this.state.loading) {
      return (
        <Segment loading className="layout-loading"/>
      );
    }

    const NavbarCollapse: any = Navbar.Collapse; // FIXME: once react-bootstrap types are fixed: pull request #3502
    const DropdownMenu: any = Dropdown.Menu; // FIXME: once react-bootstrap types are fixed

    return (
      <BrowserRouter>
        <AdminLayout loading={ this.state.loading }>
          <Sidebar dataColour="danger" backgroundColour="red">
            <Sidebar.Logo>
              <Sidebar.Logo.Item url="/" variation="mini">AI</Sidebar.Logo.Item>
              <Sidebar.Logo.Item url="/">Analyst UI</Sidebar.Logo.Item>
            </Sidebar.Logo>

            <Sidebar.Content mobile>
              <Sidebar.Item collapseId="account">
                <Sidebar.Link to="#account" root icon="person" textNormal="Account"/>
                <Sidebar.Item>
                  <Sidebar.Link to="#" textMini="LO" textNormal="Log out" onClick={ this.onLogOut }/>
                </Sidebar.Item>
              </Sidebar.Item>
            </Sidebar.Content>

            <Sidebar.Content>
              <Sidebar.Item active={ this.state.activeRoute === '/' }>
                <Sidebar.Link to="/" single icon="home" textNormal="Home" onClick={ this.setActiveRoute }/>
              </Sidebar.Item>
              <Sidebar.Item active={ this.state.activeRoute === '/sources/' }>
                <Sidebar.Link
                  to="/sources/"
                  single
                  icon="storage"
                  textNormal="Data Sources"
                  onClick={ this.setActiveRoute }
                />
              </Sidebar.Item>
            </Sidebar.Content>
          </Sidebar>

          <Navbar expand="lg" variant="dark" className="navbar-transparent navbar-absolute fixed-top">
            <div className="navbar-wrapper">
              <NavbarMinimise/>
              <Navbar.Brand href="/">
                <Route path="/" exact component={ () => <span>Home</span> }/>
                <Route path="/sources" exact component={ () => <span>Data Sources</span> }/>
              </Navbar.Brand>
            </div>

            <Navbar.Toggle aria-controls="navigation-index" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="navbar-toggler-icon icon-bar"/>
              <span className="navbar-toggler-icon icon-bar"/>
              <span className="navbar-toggler-icon icon-bar"/>
            </Navbar.Toggle>

            <NavbarCollapse className="justify-content-end">
              <Nav>
                <Dropdown as={ Nav.Item } aria-labelledby="navbarDropdownProfile">
                  <Dropdown.Toggle as={ Nav.Link } id="nav-dropdown" data-cy="user-options">
                    <i className="material-icons">person</i>
                    <p className="d-lg-none d-md-block">
                      Account
                    </p>
                  </Dropdown.Toggle>
                  <DropdownMenu alignRight>
                    <Dropdown.Item onClick={ this.onLogOut } data-cy="logout">Log out</Dropdown.Item>
                  </DropdownMenu>
                </Dropdown>
              </Nav>
            </NavbarCollapse>
          </Navbar>

          <AdminLayout.Content>
            <Switch>
              <Route path="/" exact component={ Home }/>
              <Route path="/sources" exact component={ DataSources }/>
            </Switch>
          </AdminLayout.Content>
        </AdminLayout>
      </BrowserRouter>
    );
  }

  componentDidMount() {
    Promise.all([
      localForage.getItem<string>(localForageKeys.API_KEY),
      localForage.getItem<User>(localForageKeys.USER)
    ])
      .then(([ token, user ]) => {
        if (token && user) {
          this.validateToken(token, user);
        } else {
          this.clearStorageAndGoToLogin();
        }
      })
      .catch(() => {
        this.clearStorageAndGoToLogin();
      });
  }

  private onLogOut = () => {
    localForage.getItem<string>(localForageKeys.API_KEY)
      .then(token => {
        if (token) {
          axios.request({
            url: api.routes.LOGOUT,
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `token ${token}`
            }
          })
          .then((response: AxiosResponse<string>) => {
            if (response.status === 204) {
              this.clearStorageAndGoToLogin();
            }
          })
          .catch(this.clearStorageAndGoToLogin);
        } else {
          this.clearStorageAndGoToLogin();
        }
      })
      .catch(this.clearStorageAndGoToLogin);
  }

  private validateToken(token: string, user: User) {
    axios.request({
      url: `${api.routes.USERS}${user.id}`,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`
      }
    })
    .then(({ status, data }: AxiosResponse<User>) => {
      if (status === 200 && data) {
        this.props.actions.setToken(token);
        this.props.actions.setUser({ id: data.id, username: data.username });
        this.setState({ loading: false });
      } else {
        this.clearStorageAndGoToLogin();
      }
    })
    .catch(this.clearStorageAndGoToLogin); //tslint:disable-line
  }

  private clearStorageAndGoToLogin = () => {
    localForage.clear();
    this.props.history.push('/login');
  }

  private setActiveRoute = (activeRoute: string) => {
    this.setState({ activeRoute });
  }
}

const mapStateToProps = (reduxStore: ReduxStore): { user?: UserState, token?: TokenState } => ({
  user: reduxStore.get('user') as UserState,
  token: reduxStore.get('token') as TokenState
});
const mapDispatchToProps: MapDispatchToProps<ActionProps, ComponentProps> = (dispatch): ActionProps => ({
  actions: bindActionCreators({ ...UserActions, ...TokenActions }, dispatch)
});
const ReduxConnector = connect(mapStateToProps, mapDispatchToProps)(MainLayout);

export { ReduxConnector as MainLayout };

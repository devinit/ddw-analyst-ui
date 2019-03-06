import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import { Dropdown, Nav, Navbar } from 'react-bootstrap';
import { BrowserRouter, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { NavbarMinimise } from '../components/NavbarMinimise';
import { Sidebar } from '../components/Sidebar';
import { DataSources } from '../pages/DataSources';
import { Home } from '../pages/Home';
import { api, clearStorage, getAPIToken } from '../utils';

interface MainLayoutProps extends RouteComponentProps<{}> {
  loading: boolean;
}

interface MainLayoutState {
  loading: boolean;
}

export class MainLayout extends React.Component<MainLayoutProps, MainLayoutState> {
  static defaultProps: Partial<MainLayoutProps> = {
    loading: true
  };
  state: MainLayoutState = {
    loading: this.props.loading
  };

  render() {
    if (this.state.loading) {
      return <div>Loading ...</div>;
    }

    const NavbarCollapse: any = Navbar.Collapse; // FIXME: once react-bootstrap types are fixed: pull request #3502
    const DropdownMenu: any = Dropdown.Menu; // FIXME: once react-bootstrap types are fixed

    return (
      <BrowserRouter>
        <AdminLayout loading={ this.state.loading }>
          <Sidebar dataColour="purple" backgroundColour="red">
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
              <Sidebar.Item active>
                <Sidebar.Link to="/" single icon="home" textNormal="Home"/>
              </Sidebar.Item>
              <Sidebar.Item>
                <Sidebar.Link to="/sources" single icon="storage" textNormal="Data Sources"/>
              </Sidebar.Item>
            </Sidebar.Content>
          </Sidebar>

          <Navbar expand="lg" variant="dark" className="navbar-transparent navbar-absolute fixed-top">
            <div className="navbar-wrapper">
              <NavbarMinimise/>
              <Navbar.Brand href="/">
                <Route key="home" path="/" exact component={ () => <span>Home</span> }/>
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
              <Route key="home" path="/" exact component={ Home }/>
              <Route key="home" path="/sources" exact component={ DataSources }/>
            </Switch>
          </AdminLayout.Content>
        </AdminLayout>
      </BrowserRouter>
    );
  }

  componentDidMount() {
    getAPIToken()
      .then(() => this.setState({ loading: false }))
      .catch(() => this.props.history.push('/login'));
  }

  private onLogOut = () => {
    getAPIToken()
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

  private clearStorageAndGoToLogin = () => {
    clearStorage();
    this.props.history.push('/login');
  }
}

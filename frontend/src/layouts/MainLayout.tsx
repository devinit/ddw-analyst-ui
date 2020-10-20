import axios, { AxiosResponse } from 'axios';
import * as localForage from 'localforage';
import React, { ReactElement } from 'react';
import { Dropdown, Modal, Nav, Navbar } from 'react-bootstrap';
import { connect, MapDispatchToProps } from 'react-redux';
import { BrowserRouter, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Segment } from 'semantic-ui-react';
import styled from 'styled-components';
import * as ModalActions from '../actions/modal';
import * as TokenActions from '../actions/token';
import * as UserActions from '../actions/user';
import { AccountModal } from '../components/AccountModal';
import { AdminLayout } from '../components/AdminLayout';
import { NavbarMinimise } from '../components/NavbarMinimise';
import { Sidebar } from '../components/Sidebar';
import { AsyncDataSourceQueries } from '../pages/DataSourceQueries';
import { AsyncDataSources } from '../pages/DataSources';
import { AsyncDataUpdate } from '../pages/DataUpdate';
import { AsyncHome } from '../pages/Home';
import { AsyncPublishedDatasets } from '../pages/PublishedDatasets/AsyncLoader';
import { AsyncQueryBuilder } from '../pages/QueryBuilder';
import { AsyncQueryData } from '../pages/QueryData';
import { AsyncScheduledEvents } from '../pages/ScheduledEvents';
import { ModalState } from '../reducers/modal';
import { TokenState } from '../reducers/token';
import { User, UserState } from '../reducers/user';
import { ReduxStore } from '../store';
import { api, localForageKeys } from '../utils';
import { AsyncDataSourceHistory } from '../pages/DataSourceHistory';

interface ActionProps {
  actions: typeof UserActions & typeof TokenActions & typeof ModalActions;
}
interface ComponentProps {
  loading: boolean;
}
interface ReduxProps {
  user?: UserState;
  token?: TokenState;
  modal: ModalState;
}
type MainLayoutProps = ComponentProps &
  RouteComponentProps<{ [x: string]: string | undefined }> &
  ActionProps &
  ReduxProps;

interface MainLayoutState {
  loading: boolean;
  activeRoute: string;
}

const StyledLogo = styled.img`
  width: 80%;
  margin-left: 10%;
`;

class MainLayout extends React.Component<MainLayoutProps, MainLayoutState> {
  static defaultProps: Partial<MainLayoutProps> = {
    loading: true,
  };
  state: MainLayoutState = {
    loading: this.props.loading,
    activeRoute: this.props.location.pathname,
  };

  render(): ReactElement {
    if (this.state.loading) {
      return <Segment loading className="layout-loading" />;
    }

    const ModalContent = this.props.modal.get('modal') as React.ElementType | undefined;
    const modalSize = this.props.modal.get('size') as 'sm' | 'lg' | undefined;

    return (
      <BrowserRouter>
        <AdminLayout loading={this.state.loading}>
          <Sidebar dataColour="danger" backgroundColour="red">
            <Sidebar.Logo>
              <Sidebar.Logo.Item url="/" variation="mini">
                AI
              </Sidebar.Logo.Item>
              <Sidebar.Logo.Item url="/">Analyst UI</Sidebar.Logo.Item>
            </Sidebar.Logo>

            <Sidebar.Content mobile>
              <Sidebar.Item collapseId="account">
                <Sidebar.Link to="#account" root icon="person" textNormal="Account" />
                <Sidebar.Item>
                  <Sidebar.Link to="#" textMini="LO" textNormal="Log out" onClick={this.onLogOut} />
                </Sidebar.Item>
              </Sidebar.Item>
            </Sidebar.Content>

            <Sidebar.Content>
              <Sidebar.Item active={this.state.activeRoute === '/'}>
                <Sidebar.Link
                  to="/"
                  single
                  icon="home"
                  textNormal="My Datasets"
                  onClick={this.setActiveRoute}
                />
              </Sidebar.Item>
              <Sidebar.Item active={this.state.activeRoute === '/datasets/'}>
                <Sidebar.Link
                  to="/datasets/"
                  single
                  icon="table_chart"
                  textNormal="Published Datasets"
                  onClick={this.setActiveRoute}
                />
              </Sidebar.Item>
              <Sidebar.Item active={this.state.activeRoute === '/queries/build/'}>
                <Sidebar.Link
                  to="/queries/build/"
                  single
                  icon="query_builder"
                  textNormal="Query Builder"
                  onClick={this.setActiveRoute}
                  data-testid="sidebar-link-query-builder"
                />
              </Sidebar.Item>
              <Sidebar.Item active={this.state.activeRoute === '/sources/'}>
                <Sidebar.Link
                  to="/sources/"
                  single
                  icon="storage"
                  textNormal="Data Sources"
                  onClick={this.setActiveRoute}
                  data-testid="sidebar-link-sources"
                />
              </Sidebar.Item>
              <Sidebar.Item active={this.state.activeRoute === '/update/'}>
                <Sidebar.Link
                  to="/update/"
                  single
                  icon="library_add"
                  textNormal="Update Data Source"
                  onClick={this.setActiveRoute}
                  data-testid="sidebar-link-update"
                />
              </Sidebar.Item>
              <Sidebar.Item active={this.state.activeRoute === '/scheduledevents/'}>
                <Sidebar.Link
                  to="/scheduledevents/"
                  single
                  icon="alarm"
                  textNormal="Scheduled Events"
                  onClick={this.setActiveRoute}
                />
              </Sidebar.Item>
            </Sidebar.Content>

            <Sidebar.Footer>
              <StyledLogo src="/static/frontend/assets/images/logo.png" />
            </Sidebar.Footer>
          </Sidebar>

          <Navbar
            expand="lg"
            variant="dark"
            className="navbar-transparent navbar-absolute fixed-top"
          >
            <div className="navbar-wrapper">
              <NavbarMinimise />
              <Navbar.Brand href="/">
                <Route path="/" exact component={(): ReactElement => <span>My Datasets</span>} />
                <Route
                  path="/datasets"
                  exact
                  component={(): ReactElement => <span>Published Datasets</span>}
                />
                <Route
                  path="/sources"
                  exact
                  component={(): ReactElement => <span>Data Sources</span>}
                />
                <Route
                  path="/queries/build"
                  component={(): ReactElement => <span>Query Builder</span>}
                />
                <Route
                  path="/update"
                  component={(): ReactElement => <span>Update Data Source</span>}
                />
                <Route
                  path="/scheduledevents/"
                  component={(): ReactElement => <span>Scheduled Events</span>}
                />
                <Route
                  path="/source/datasets/:id/"
                  component={(): ReactElement => <span>Source Datasets</span>}
                />
                <Route
                  path="/source/history/:id/"
                  component={(): ReactElement => <span>Source History</span>}
                />
              </Navbar.Brand>
            </div>

            <Navbar.Toggle aria-controls="navigation-index" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="navbar-toggler-icon icon-bar" />
              <span className="navbar-toggler-icon icon-bar" />
              <span className="navbar-toggler-icon icon-bar" />
            </Navbar.Toggle>

            <Navbar.Collapse className="justify-content-end">
              <Nav>
                <Dropdown as={Nav.Item} aria-labelledby="navbarDropdownProfile">
                  <Dropdown.Toggle as={Nav.Link} id="nav-dropdown" data-cy="user-options">
                    <i className="material-icons">person</i>
                    <p className="d-lg-none d-md-block">Account</p>
                  </Dropdown.Toggle>
                  <Dropdown.Menu alignRight>
                    <Dropdown.Item data-cy="account" onClick={this.openAccountModal}>
                      Change Password
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={this.onLogOut} data-cy="logout">
                      Log Out
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          <AdminLayout.Content>
            <Switch>
              <Route path="/" exact component={AsyncHome} />
              <Route path="/datasets" exact component={AsyncPublishedDatasets} />
              <Route path="/sources" exact component={AsyncDataSources} />
              <Route path="/queries/build" exact component={AsyncQueryBuilder} />
              <Route path="/queries/build/:id" exact component={AsyncQueryBuilder} />
              <Route path="/update" exact component={AsyncDataUpdate} />
              <Route path="/queries/data/:id" exact component={AsyncQueryData} />
              <Route path="/scheduledevents" exact component={AsyncScheduledEvents} />
              <Route path="/source/datasets/:id" exact component={AsyncDataSourceQueries} />
              <Route path="/source/history/:id" exact component={AsyncDataSourceHistory} />
            </Switch>
            <Modal show={!!ModalContent} onHide={this.closeModal} size={modalSize}>
              {ModalContent ? <ModalContent /> : null}
            </Modal>
          </AdminLayout.Content>
        </AdminLayout>
      </BrowserRouter>
    );
  }

  componentDidMount(): void {
    Promise.all([
      localForage.getItem<string>(localForageKeys.API_KEY),
      localForage.getItem<User>(localForageKeys.USER),
    ])
      .then(([token, user]) => {
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

  componentDidUpdate(prevProps: MainLayoutProps): void {
    if (prevProps.token && !this.props.token) {
      this.clearStorageAndGoToLogin();
    }
  }

  private onLogOut = (): void => {
    localForage
      .getItem<string>(localForageKeys.API_KEY)
      .then((token) => {
        if (token) {
          axios
            .request({
              url: api.routes.LOGOUT,
              method: 'post',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `token ${token}`,
              },
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
  };

  private openAccountModal = (): void => {
    this.props.actions.toggleModal(AccountModal);
  };

  private closeModal = (): void => {
    this.props.actions.toggleModal();
  };

  private validateToken(token: string, user: User): void {
    axios
      .request({
        url: `${api.routes.USERS}${user.id}/`,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${token}`,
        },
      })
      .then(({ status, data }: AxiosResponse<User>) => {
        if (status === 200 && data) {
          this.props.actions.setToken(token);
          this.props.actions.setUser({
            id: data.id,
            username: data.username,
            is_superuser: data.is_superuser, // eslint-disable-line @typescript-eslint/naming-convention
          });
          this.setState({ loading: false });
        } else {
          this.clearStorageAndGoToLogin();
        }
      })
      .catch(this.clearStorageAndGoToLogin); //tslint:disable-line
  }

  private clearStorageAndGoToLogin = (): void => {
    localForage.clear();
    this.props.history.push('/login');
  };

  private setActiveRoute = (activeRoute: string): void => {
    this.setState({ activeRoute });
  };
}

const mapStateToProps = (reduxStore: ReduxStore): ReduxProps => ({
  user: reduxStore.get('user') as UserState,
  token: reduxStore.get('token') as TokenState,
  modal: reduxStore.get('modal') as ModalState,
});
const mapDispatchToProps: MapDispatchToProps<ActionProps, ComponentProps> = (
  dispatch,
): ActionProps => ({
  actions: bindActionCreators({ ...UserActions, ...TokenActions, ...ModalActions }, dispatch),
});
const ReduxConnector = connect(mapStateToProps, mapDispatchToProps)(MainLayout);

export { ReduxConnector as MainLayout, ReduxConnector as default };

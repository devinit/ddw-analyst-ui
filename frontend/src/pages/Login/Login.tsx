import { FormikHelpers as FormikActions } from 'formik/dist/types';
import { Base64 } from 'js-base64';
import * as localForage from 'localforage';
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import * as TokenActions from '../../actions/token';
import * as UserActions from '../../actions/user';
import { Credentials, LoginForm } from '../../components/LoginForm';
import { PageWrapper } from '../../components/PageWrapper';
import { User } from '../../reducers/user';
import { api, localForageKeys } from '../../utils';

interface LoginState {
  showForm: boolean;
  loading: boolean;
  alert?: string;
}
export type LoginActions = typeof UserActions & typeof TokenActions;
interface ActionProps {
  actions: LoginActions;
}
type LoginProps = RouteComponentProps<{ [x: string]: string | undefined }> & ActionProps;

const CustomHeaderElement = (props: any) => {
  return (
    /* eslint-disable-next-line */
    <div className="page-header login-page header-filter" filter-color="red">
      {props.children}
    </div>
  );
};

const StyledHeaderElement = styled(CustomHeaderElement)`
  background-size: cover;
  background-position: top center;
`;

const StyledLoadingDiv = styled.div`
  text-align: center;
`;

export class Login extends React.Component<LoginProps, LoginState> {
  state: LoginState = {
    showForm: false,
    loading: true,
  };

  render() {
    return (
      <PageWrapper fullPage>
        <StyledHeaderElement>
          <div className="container">
            <Row>
              <Col lg={4} md={6} sm={8} className="ml-auto mr-auto">
                {this.renderContent()}
              </Col>
            </Row>
          </div>
        </StyledHeaderElement>
      </PageWrapper>
    );
  }

  componentDidMount() {
    this.removeNavOpenClass();
    localForage
      .getItem<string>(localForageKeys.API_KEY)
      .then((token) => {
        if (token) {
          this.props.history.push('/');
        } else {
          this.onNotAuthenticated();
        }
      })
      .catch(() => {
        this.onNotAuthenticated();
      });
  }

  private renderContent() {
    if (this.state.loading) {
      return <StyledLoadingDiv>Loading...</StyledLoadingDiv>;
    }

    return (
      <LoginForm showForm={this.state.showForm} onSuccess={this.onLogin} alert={this.state.alert} />
    );
  }

  private onNotAuthenticated = () => {
    setTimeout(() => {
      this.setState({ showForm: true, loading: false });
    }, 700);
  };

  private onLogin = (
    { username, password }: Credentials,
    _formikActions: FormikActions<Credentials>,
  ) => {
    window
      .fetch(api.routes.LOGIN, {
        method: 'POST',
        credentials: 'omit',
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Base64.encode(`${username}:${password}`)}`,
        },
      })
      .then((response) => response.json())
      .then(({ detail, token, user }: { token?: string; detail?: string; user?: User }) => {
        if (token && user) {
          this.storeTokenPlusUser(token, user);
          this.props.history.push('/');
        } else if (detail) {
          this.setState({ alert: detail });
        }
      })
      .catch(console.log); // tslint:disable-line
  };

  private storeTokenPlusUser(token: string, { id, username, is_superuser }: User) {
    localForage.setItem(localForageKeys.API_KEY, token);
    localForage.setItem(localForageKeys.USER, { id, username, is_superuser });
    this.props.actions.setToken(token);
    this.props.actions.setUser({ id, username, is_superuser });
  }

  private removeNavOpenClass() {
    Array.from(document.getElementsByClassName('nav-open')).forEach((element) =>
      element.classList.remove('nav-open'),
    );
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, Record<string, unknown>> = (
  dispatch,
): ActionProps => ({
  actions: bindActionCreators({ ...UserActions, ...TokenActions }, dispatch),
});
export default connect(null, mapDispatchToProps)(Login);

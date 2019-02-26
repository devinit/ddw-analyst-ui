import { FormikActions } from 'formik/dist/types';
import { css } from 'glamor';
import * as localForage from 'localforage';
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { Credentials, LoginForm } from '../../components/LoginForm';
import { PageWrapper } from '../../components/PageWrapper';
import { api, localForageKeys, verifyAuthentication } from '../../utils';
import axios, { AxiosResponse } from 'axios';

interface LoginState {
  showForm: boolean;
  loading: boolean;
  alert?: string;
}

export class Login extends React.Component<RouteComponentProps<{}>, LoginState> {
  private headerStyles = css({
    backgroundSize: 'cover',
    backgroundPosition: 'top center'
  });
  private loadingStyles = css({ textAlign: 'center' });
  state: LoginState = {
    showForm: false,
    loading: true
  };

  render() {
    return (
      <PageWrapper fullPage>
        <div className="page-header login-page header-filter" filter-color="red" { ...this.headerStyles }>
          <div className="container">
            <Row>
              <Col lg={ 4 } md={ 6 } sm={ 8 } className="ml-auto mr-auto">
                { this.renderContent() }
              </Col>
            </Row>
          </div>
        </div>
      </PageWrapper>
    );
  }

  componentDidMount() {
    verifyAuthentication()
      .then(() => this.props.history.push('/'))
      .catch(() => {
        setTimeout(() => {
          this.setState({ showForm: true, loading: false });
        }, 700);
      });
  }

  private renderContent() {
    if (this.state.loading) {
      return <div { ...this.loadingStyles }>Loading...</div>;
    }

    return <LoginForm showForm={ this.state.showForm } onSuccess={ this.onLogin } alert={ this.state.alert }/>;
  }

  private onLogin = ({ username, password }: Credentials, _formikActions: FormikActions<Credentials>) => {
    axios.request({
      url: api.routes.LOGIN,
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      auth: { username, password }
    })
    .then((response: AxiosResponse<{ token?: string, detail?: string }>) => {
      if (response.data.token) {
        localForage.setItem(localForageKeys.API_KEY, response.data.token);
        this.props.history.push('/');
      } else if (response.data.detail) {
        this.setState({ alert: response.data.detail });
      }
    })
    .catch(console.log); // tslint:disable-line
  }
}

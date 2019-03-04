import { FormikActions } from 'formik/dist/types';
import { css } from 'glamor';
import { Base64 } from 'js-base64';
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { Credentials, LoginForm } from '../../components/LoginForm';
import { PageWrapper } from '../../components/PageWrapper';
import { api, getAPIToken, setAPIToken } from '../../utils';

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
    this.removeNavOpenClass();
    getAPIToken()
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
    window.fetch(api.routes.LOGIN, {
      method: 'POST',
      credentials: 'omit',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Base64.encode(`${username}:${password}`)}`
      }
    })
    .then(response => response.json())
    .then((response: { token?: string, detail?: string }) => {
      if (response.token) {
        setAPIToken(response.token);
        this.props.history.push('/');
      } else if (response.detail) {
        this.setState({ alert: response.detail });
      }
    })
    .catch(console.log); // tslint:disable-line
  }

  private removeNavOpenClass() {
    Array.from(document.getElementsByClassName('nav-open'))
      .forEach(element => element.classList.remove('nav-open'));
  }
}

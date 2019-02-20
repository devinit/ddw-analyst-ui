import { css } from 'glamor';
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { LoginForm } from '../../components/LoginForm';
import { PageWrapper } from '../../components/PageWrapper';

interface LoginState {
  showForm: boolean;
}

export class Login extends React.Component<{}, LoginState> {
  private headerStyles = css({
    backgroundSize: 'cover',
    backgroundPosition: 'top center'
  });
  state = {
    showForm: false
  };

  render() {
    return (
      <PageWrapper fullPage>
        <div className="page-header login-page header-filter" filter-color="red" { ...this.headerStyles }>
          <div className="container">
            <Row>
              <Col lg={ 4 } md={ 6 } sm={ 8 } className="ml-auto mr-auto">
                <LoginForm showForm={ this.state.showForm }/>
              </Col>
            </Row>
          </div>
        </div>
      </PageWrapper>
    );
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ showForm: true });
    }, 700);
  }

  onLogin = (_event: React.FormEvent) => {
    //
  }
}

import * as React from 'react';
import classNames from 'classnames';
import { css } from 'glamor';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { PageWrapper } from '../../components/PageWrapper';
import { SocialLine } from '../../components/SocialLine';
import { FormControl } from 'react-bootstrap';

export class Login extends React.Component<{}, { showCard: boolean }> {
  private headerStyles = css({
    backgroundSize: 'cover',
    backgroundPosition: 'top center'
  });
  state = {
    showCard: false
  };

  render() {
    return (
      <PageWrapper fullPage>
        <div className="page-header login-page header-filter" filter-color="red" { ...this.headerStyles }>
          <div className="container">
            <Row>
              <Col lg={ 4 } md={ 6 } sm={ 8 } className="ml-auto mr-auto">
                <Form className="form">
                  <Card className={ classNames('card-login', { 'card-hidden': !this.state.showCard }) }>
                    <Card.Header className="card-header-rose text-center">
                      <Card.Title>Login</Card.Title>
                      <SocialLine google/>
                    </Card.Header>
                    <Card.Body>
                      <p className="card-description text-center">Or Go With</p>
                      <span className="bmd-form-group">
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text><i className="material-icons">email</i></InputGroup.Text>
                          </InputGroup.Prepend>
                          <FormControl type="email" placeholder="Email..."/>
                        </InputGroup>
                      </span>
                      <span className="bmd-form-group">
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text><i className="material-icons">lock_outline</i></InputGroup.Text>
                          </InputGroup.Prepend>
                          <FormControl type="password" placeholder="Password..."/>
                        </InputGroup>
                      </span>
                    </Card.Body>
                    <Card.Footer className="justify-content-center">
                      <Button variant="link" size="lg" className="btn-rose">Login</Button>
                    </Card.Footer>
                  </Card>
                </Form>
              </Col>
            </Row>
          </div>
        </div>
      </PageWrapper>
    );
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ showCard: true });
    }, 700);
  }

}

import classNames from 'classnames';
import { Formik, FormikActions, FormikProps } from 'formik';
import * as React from 'react';
import { Alert, Button, Card, Form, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';
import * as Yup from 'yup';
import SocialLine from '@bit/devinit.analyst-ui.components.social-line';

interface LoginFormState {
  credentials: Credentials;
  alerts: Partial<Credentials>;
}

export interface Credentials {
  username: string;
  password: string;
}

interface LoginFormProps {
  showForm?: boolean;
  alert?: string;
  onSuccess: (values: Credentials, formikActions: FormikActions<Credentials>) => void;
}

const StyledFormFeedback = styled(Form.Control.Feedback)`margin-left: 55px`;
const StyledAlert = styled(Alert)`margin-left: 15px`;

export class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
  static defaultProps: Partial<LoginFormProps> = { showForm: true };
  state: LoginFormState = {
    credentials: { username: '', password: '' },
    alerts: {}
  };
  private schema = Yup.object().shape({
    username: Yup.string().required('Username is required!'),
    password: Yup.string().required('Password is required!')
  });

  render() {
    const initialValues: Credentials = { username: '', password: '' };
    return (
      <Formik validationSchema={ this.schema } initialValues={ initialValues } onSubmit={ this.props.onSuccess }>
        {
          ({ errors, handleChange, handleSubmit, touched }: FormikProps<Credentials>) => (
            <Form className="form" noValidate onSubmit={ handleSubmit } data-testid="login-form">
              <Card className={ classNames('card-login', { 'card-hidden': !this.props.showForm }) }>
                <Card.Header className="card-header-rose text-center">
                  <Card.Title>Login</Card.Title>
                  <SocialLine/>
                </Card.Header>
                <Card.Body>
                  <p className="card-description text-center d-none">Or Go With</p>
                  <StyledAlert variant="danger" hidden={ !this.props.alert }>
                    { this.props.alert }
                  </StyledAlert>
                  <span className="bmd-form-group">
                    <InputGroup>
                      <InputGroup.Prepend>
                        <InputGroup.Text><i className="material-icons">email</i></InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        required
                        name="username"
                        type="email"
                        placeholder="Email..."
                        onChange={ handleChange }
                        isInvalid={ !!errors.username }
                      />
                      <StyledFormFeedback type="invalid">
                        { touched.username && errors.username ? errors.username : null }
                      </StyledFormFeedback>
                    </InputGroup>
                  </span>
                  <span className="bmd-form-group">
                    <InputGroup>
                      <InputGroup.Prepend>
                        <InputGroup.Text><i className="material-icons">lock_outline</i></InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        name="password"
                        type="password"
                        placeholder="Password..."
                        onChange={ handleChange }
                        isInvalid={ !!errors.password }
                      />
                      <StyledFormFeedback type="invalid">
                        { touched.password && errors.password ? errors.password : null }
                      </StyledFormFeedback>
                    </InputGroup>
                  </span>
                </Card.Body>
                <Card.Footer className="justify-content-center">
                  <Button variant="link" size="lg" className="btn-rose" type="submit">Login</Button>
                </Card.Footer>
              </Card>
            </Form>
          )
        }
      </Formik>
    );
  }
}

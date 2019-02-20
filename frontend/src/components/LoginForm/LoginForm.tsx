import classNames from 'classnames';
import { Formik, FormikActions, FormikProps } from 'formik';
import { css } from 'glamor';
import * as React from 'react';
import { Button, Card, Form, InputGroup } from 'react-bootstrap';
import * as Yup from 'yup';
import { SocialLine } from '../SocialLine';

interface LoginFormState {
  credentials: Credentials;
  alerts: Partial<Credentials>;
}

interface Credentials {
  username: string;
  password: string;
}

interface LoginFormProps {
  showForm?: boolean;
}

export class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
  static defaultProps: LoginFormProps = { showForm: true };
  state: LoginFormState = {
    credentials: { username: '', password: '' },
    alerts: {}
  };
  private feedbackStyles = css({ marginLeft: '55px' });
  private schema = Yup.object().shape({
    username: Yup.string().required('Username is required!'),
    password: Yup.string().required('Password is required!')
  });

  render() {
    const initialValues: Credentials = { username: '', password: '' };
    return (
      <Formik validationSchema={ this.schema } initialValues={ initialValues } onSubmit={ this.onLogin }>
        {
          ({ errors, handleChange, handleSubmit }: FormikProps<Credentials>) => (
            <Form className="form" noValidate onSubmit={ handleSubmit }>
              <Card className={ classNames('card-login', { 'card-hidden': !this.props.showForm }) }>
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
                      <Form.Control
                        required
                        name="username"
                        type="email"
                        placeholder="Email..."
                        onChange={ handleChange }
                        isInvalid={ !!errors.username }
                      />
                      <Form.Control.Feedback type="invalid" { ...this.feedbackStyles }>
                        { errors.username }
                      </Form.Control.Feedback>
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
                      <Form.Control.Feedback type="invalid" { ...this.feedbackStyles }>
                        { errors.password }
                      </Form.Control.Feedback>
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

  onChange = ({ currentTarget }: React.FormEvent<any>) => {
    const credentials: Credentials = { ...this.state.credentials, [currentTarget.name]: currentTarget.value };
    this.setState({ ...this.state, credentials });
  }

  onLogin = (_values: Credentials, _formikActions: FormikActions<Credentials>) => {
    this.validate(this.state.credentials);
  }

  validate({ username, password }: Credentials) {
    if (!username) {
      this.setState({ alerts: { username: 'Username is required!' } });
    } else if (!password) {
      this.setState({ alerts: { password: 'Password is required!' } });
    } else {
      return true;
    }
  }
}

import classNames from 'classnames';
import { Formik, FormikProps } from 'formik';
import * as React from 'react';
import { Alert, Button, Col, Form } from 'react-bootstrap';
import * as Yup from 'yup';

interface ChangePasswordFormState {
  hasFocus: string;
}

interface ChangePasswordFormProps {
  alert?: string;
  errors?: { [key in keyof ChangePasswordFields]?: string };
  editing?: boolean;
  editable?: boolean;
  onSuccess: (values: ChangePasswordFields) => void;
}

export interface ChangePasswordFields {
  old_password: string;
  new_password1: string;
  new_password2: string;
}

export class ChangePasswordForm extends React.Component<
  ChangePasswordFormProps,
  ChangePasswordFormState
> {
  static defaultProps: Partial<ChangePasswordFormProps> = {
    editable: true,
  };
  state: ChangePasswordFormState = {
    hasFocus: '',
  };
  private schema = Yup.object().shape({
    old_password: Yup.string().required('Old password is required!'),
    new_password1: Yup.string().required('New password is required'),
    new_password2: Yup.string()
      .required('New password confirmation is required!')
      .oneOf([Yup.ref('new_password1'), null], 'Passwords do not match'),
  });

  render() {
    const initialValues: ChangePasswordFields = {
      old_password: '',
      new_password1: '',
      new_password2: '',
    };

    return (
      <Formik
        validationSchema={this.schema}
        initialValues={initialValues}
        onSubmit={this.props.onSuccess}
      >
        {({ errors, handleChange, handleSubmit, values }: FormikProps<ChangePasswordFields>) => {
          errors = { ...errors, ...this.props.errors };

          return (
            <Form
              className="form"
              noValidate
              onSubmit={handleSubmit}
              data-testid="operation-step-form"
            >
              <Alert variant="danger" hidden={!this.props.alert}>
                {this.props.alert}
              </Alert>

              <Col>
                <Form.Group
                  className={this.getFormGroupClasses('old_password', values.old_password)}
                >
                  <Form.Label className="bmd-label-floating">Old Password</Form.Label>
                  <Form.Control
                    required
                    name="old_password"
                    type="password"
                    onChange={handleChange}
                    defaultValue={values.old_password || ''}
                    isInvalid={!!errors.old_password}
                    onFocus={this.setFocusedField}
                    onBlur={this.resetFocus}
                    disabled={!this.props.editable}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.old_password ? errors.old_password : null}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group
                  className={this.getFormGroupClasses('new_password1', values.new_password1)}
                >
                  <Form.Label className="bmd-label-floating">New Password</Form.Label>
                  <Form.Control
                    name="new_password1"
                    type="password"
                    onChange={handleChange}
                    isInvalid={!!errors.new_password1}
                    onFocus={this.setFocusedField}
                    onBlur={this.resetFocus}
                    defaultValue={values.new_password1 || ''}
                    disabled={!this.props.editable}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.new_password1 ? errors.new_password1 : null}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group
                  className={this.getFormGroupClasses('new_password2', values.new_password2)}
                >
                  <Form.Label className="bmd-label-floating">Confirm Password</Form.Label>
                  <Form.Control
                    name="new_password2"
                    type="password"
                    onChange={handleChange}
                    isInvalid={!!errors.new_password2}
                    onFocus={this.setFocusedField}
                    onBlur={this.resetFocus}
                    defaultValue={values.new_password2 || ''}
                    disabled={!this.props.editable}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.new_password2 ? errors.new_password2 : null}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12} className="mt-3">
                <Button
                  variant="danger"
                  className="float-right"
                  type="submit"
                  hidden={!this.props.editable}
                >
                  {this.props.editing ? 'Updating ...' : 'Update Password'}
                </Button>
                <Button
                  variant="secondary"
                  className={classNames('float-right', { 'd-none': !this.props.editing })}
                  hidden={!this.props.editable}
                >
                  Cancel
                </Button>
              </Col>
            </Form>
          );
        }}
      </Formik>
    );
  }

  private getFormGroupClasses(fieldName: string, value: string | number) {
    return classNames('bmd-form-group', {
      'is-focused': this.state.hasFocus === fieldName,
      'is-filled': value,
    });
  }

  private setFocusedField = ({ currentTarget }: React.FocusEvent<HTMLInputElement>) => {
    this.setState({ hasFocus: currentTarget.name });
  };

  private resetFocus = () => {
    this.setState({ hasFocus: '' });
  };
}

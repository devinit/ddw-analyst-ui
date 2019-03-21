import classNames from 'classnames';
import { Formik, FormikActions, FormikProps } from 'formik';
import * as React from 'react';
import { Alert, Col, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { Operation, OperationMap } from '../../types/query-builder';

interface OperationFormProps {
  operation?: OperationMap;
  alert?: string;
}
interface OperationFormState {
  alerts: Partial<Operation>;
  hasFocus: string;
}

export class OperationForm extends React.Component<OperationFormProps> {
  state: OperationFormState = {
    alerts: {},
    hasFocus: ''
  };
  private schema = Yup.object().shape({
    step_id: Yup.string().required('Step ID is required!'),
    name: Yup.string().required('Name is required!')
  });

  render() {
    const { operation } = this.props;
    const initialValues: Partial<Operation> = operation ? operation.toJS() : {};

    return (
      <Formik validationSchema={ this.schema } initialValues={ initialValues } onSubmit={ this.onSuccess }>
        {
          ({ errors, handleChange, handleSubmit, touched, values }: FormikProps<Operation>) => (
            <Form className="form" noValidate onSubmit={ handleSubmit } data-testid="operation-form">
              <Alert variant="danger" hidden={ !this.props.alert }>
                { this.props.alert }
              </Alert>

              <Col>
                <Form.Group className={ this.getFormGroupClasses('name', values.name) }>
                  <Form.Label className="bmd-label-floating">Name</Form.Label>
                  <Form.Control
                    required
                    name="name"
                    type="text"
                    defaultValue={ values.name }
                  />
                  <Form.Control.Feedback type="invalid">
                    { touched.name && errors.name ? errors.name : null }
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className={ this.getFormGroupClasses('description', values.description) }>
                  <Form.Label className="bmd-label-floating">Description</Form.Label>
                  <Form.Control
                    name="description"
                    as="textarea"
                    onChange={ handleChange }
                    isInvalid={ !!errors.name }
                    onFocus={ this.setFocusedField }
                    onBlur={ this.resetFocus }
                    defaultValue={ values.description ? values.description.toString() : '' }
                  />
                  <Form.Control.Feedback type="invalid">
                    { touched.description && errors.description ? errors.description : null }
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className={ this.getFormGroupClasses('sample_output_path', values.sample_output_path) }>
                  <Form.Label className="bmd-label-floating">Sample Output Path</Form.Label>
                  <Form.Control
                    name="sample_output_path"
                    type="text"
                    onChange={ handleChange }
                    isInvalid={ !!errors.sample_output_path }
                    onFocus={ this.setFocusedField }
                    onBlur={ this.resetFocus }
                    defaultValue={ values.sample_output_path }
                  />
                  <Form.Control.Feedback type="invalid">
                    { touched.sample_output_path && errors.sample_output_path ? errors.sample_output_path : null }
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Check type="checkbox">
                    <Form.Check.Label>
                      <Form.Check.Input/>
                      Is Draft
                      <span className="form-check-sign">
                        <span className="check"/>
                      </span>
                    </Form.Check.Label>
                  </Form.Check>
                </Form.Group>
              </Col>
            </Form>
          )
        }
      </Formik>
    );
  }

  private getFormGroupClasses(fieldName: string, value: string | number) {
    return classNames('bmd-form-group', {
      'is-focused': this.state.hasFocus === fieldName,
      'is-filled': value
    });
  }

  private setFocusedField = ({ currentTarget }: React.FocusEvent<HTMLInputElement>) => {
    this.setState({ hasFocus: currentTarget.name });
  }

  private resetFocus = () => {
    this.setState({ hasFocus: '' });
  }

  private onSuccess(_values: Operation, _formikActions: FormikActions<Operation>) {
    //
  }
}

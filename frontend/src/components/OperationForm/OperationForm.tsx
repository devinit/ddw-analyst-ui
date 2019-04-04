import classNames from 'classnames';
import { Formik, FormikProps } from 'formik';
import { fromJS } from 'immutable';
import { debounce } from 'lodash';
import * as React from 'react';
import { Alert, Button, Col, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { Operation, OperationMap } from '../../types/operations';
import { CheckBox } from '../CheckBox';

interface OperationFormProps {
  operation?: OperationMap;
  alert?: string;
  valid?: boolean;
  processing?: boolean;
  onUpdateOperation?: (operation: OperationMap) => void;
  onSuccess: () => void;
}
interface OperationFormState {
  alerts: Partial<Operation>;
  hasFocus: string;
}

export class OperationForm extends React.Component<OperationFormProps> {
  static defaultProps: Partial<OperationFormProps> = {
    valid: true,
    processing: false
  };
  state: OperationFormState = {
    alerts: {},
    hasFocus: ''
  };
  private schema = Yup.object().shape({
    name: Yup.string().required('Name is required!'),
    description: Yup.string().required('Description is required!')
  });

  render() {
    const values: Partial<Operation> = this.props.operation ? this.props.operation.toJS() : {};

    return (
      <Formik
        validationSchema={ this.schema }
        initialValues={ values }
        onSubmit={ this.onSuccess }
        isInitialValid={ this.schema.isValidSync(values) }
      >
        {
          ({ errors, isSubmitting, isValid, setFieldValue }: FormikProps<Operation>) => (
            <Form className="form" noValidate data-testid="operation-form">
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
                    isInvalid={ !!errors.name }
                    onChange={ debounce(this.onChange(setFieldValue), 1000, { leading: true }) }
                    onFocus={ this.setFocusedField }
                    onBlur={ this.resetFocus }
                  />
                  <Form.Control.Feedback type="invalid">
                    { errors.name ? errors.name : null }
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className={ this.getFormGroupClasses('description', values.description) }>
                  <Form.Label className="bmd-label-floating">Description</Form.Label>
                  <Form.Control
                    name="description"
                    as="textarea"
                    onChange={ debounce(this.onChange(setFieldValue), 1000, { leading: true }) }
                    isInvalid={ !!errors.description }
                    onFocus={ this.setFocusedField }
                    onBlur={ this.resetFocus }
                    defaultValue={ values.description ? values.description.toString() : '' }
                  />
                  <Form.Control.Feedback type="invalid">
                    { errors.description ? errors.description : null }
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className={ this.getFormGroupClasses('sample_output_path', values.sample_output_path) }>
                  <Form.Label className="bmd-label-floating">Sample Output Path</Form.Label>
                  <Form.Control
                    name="sample_output_path"
                    type="text"
                    onChange={ debounce(this.onChange(setFieldValue), 1000, { leading: true }) }
                    isInvalid={ !!errors.sample_output_path }
                    onFocus={ this.setFocusedField }
                    onBlur={ this.resetFocus }
                    defaultValue={ values.sample_output_path }
                  />
                  <Form.Control.Feedback type="invalid">
                    { errors.sample_output_path ? errors.sample_output_path : null }
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col>
                <CheckBox defaultChecked={ values.is_draft } onChange={ this.toggleDraft } label="Is Draft"/>
              </Col>

              <Button
                variant="danger"
                disabled={ !this.props.valid || !isValid || isSubmitting || this.props.processing }
                onClick={ this.onSuccess }
              >
                { this.props.processing ? 'Saving ...' : 'Save' }
              </Button>
            </Form>
          )
        }
      </Formik>
    );
  }

  private getFormGroupClasses(fieldName: string, value?: string | number) {
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

  private onChange = (setFieldValue: (field: string, value: any) => void) =>
    ({ currentTarget }: React.FormEvent<any>) => {
      const { name, value } = currentTarget;
      setFieldValue(name, value);
      if (this.props.onUpdateOperation) {
        if (this.props.operation) {
          this.props.onUpdateOperation(this.props.operation.set(name, value));
        } else {
          const operation = fromJS({ [name]: value });
          this.props.onUpdateOperation(operation);
        }
      }
    }

  private toggleDraft = () => {
    if (this.props.onUpdateOperation) {
      if (this.props.operation) {
        const isDraft = !!this.props.operation.get('is_draft');
        const operation = this.props.operation.set('is_draft', !isDraft);
        this.props.onUpdateOperation(operation);
      } else {
        const operation = fromJS({ is_draft: true });
        this.props.onUpdateOperation(operation);
      }
    }
  }

  private onSuccess = () => {
    this.props.onSuccess();
  }
}

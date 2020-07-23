import classNames from 'classnames';
import { Formik, FormikProps } from 'formik';
import { fromJS } from 'immutable';
import { debounce } from 'lodash';
import * as React from 'react';
import { Alert, Button, Dropdown, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { Operation, OperationMap } from '../../types/operations';
import { CheckBox } from '../CheckBox';

interface OperationFormProps {
  operation?: OperationMap;
  editable?: boolean;
  alert?: string;
  valid?: boolean;
  processing?: boolean;
  onUpdateOperation?: (operation: OperationMap) => void;
  onDeleteOperation?: (operation: OperationMap) => void;
  onDuplicateOperation?: (operation: OperationMap) => void;
  onSuccess: (preview?: boolean) => void;
  onReset?: () => void;
}
interface OperationFormState {
  alerts: Partial<Operation>;
  hasFocus: string;
}

export class OperationForm extends React.Component<OperationFormProps> {
  static defaultProps: Partial<OperationFormProps> = {
    valid: true,
    processing: false,
  };
  state: OperationFormState = {
    alerts: {},
    hasFocus: '',
  };
  private schema = Yup.object().shape({
    name: Yup.string().required('Name is required!'),
  });

  render() {
    const values: Partial<Operation> = this.props.operation ? this.props.operation.toJS() : {};

    return (
      <Formik
        validationSchema={this.schema}
        initialValues={values}
        onSubmit={this.onSuccess()}
        validateOnMount
      >
        {({ errors, isSubmitting, isValid, setFieldValue }: FormikProps<Operation>) => (
          <Form className="form" noValidate data-testid="operation-form">
            <Alert variant="danger" hidden={!this.props.alert}>
              {this.props.alert}
            </Alert>

            <Form.Group className={this.getFormGroupClasses('name', values.name)}>
              <Form.Label className="bmd-label-floating">Name</Form.Label>
              <Form.Control
                required
                name="name"
                type="text"
                value={values.name || ''}
                isInvalid={!!errors.name}
                onChange={debounce(this.onChange(setFieldValue), 1000, { leading: true })}
                onFocus={this.setFocusedField}
                onBlur={this.resetFocus}
                disabled={!!values.id && !this.props.editable}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name ? errors.name : null}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className={this.getFormGroupClasses('description', values.description)}>
              <Form.Label className="bmd-label-floating">Description</Form.Label>
              <Form.Control
                name="description"
                as="textarea"
                onChange={debounce(this.onChange(setFieldValue), 1000, { leading: true })}
                isInvalid={!!errors.description}
                onFocus={this.setFocusedField}
                onBlur={this.resetFocus}
                value={values.description ? values.description.toString() : ''}
                disabled={!!values.id && !this.props.editable}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description ? errors.description : null}
              </Form.Control.Feedback>
            </Form.Group>

            <CheckBox
              defaultChecked={values.is_draft}
              onChange={this.toggleDraft}
              label="Is Draft"
              disabled={!!values.id && !this.props.editable}
            />

            {this.props.children}

            <Dropdown hidden={!!values.id && !this.props.editable}>
              <Button
                variant="danger"
                disabled={!this.props.valid || !isValid || isSubmitting || this.props.processing}
                onClick={this.onSuccess()}
                size="sm"
              >
                {this.props.processing ? 'Saving ...' : 'Save'}
              </Button>
              <Dropdown.Toggle
                split
                variant="danger"
                id="operation-form-actions"
                size="sm"
                disabled={!this.props.valid || !isValid || isSubmitting || this.props.processing}
              />
              <Dropdown.Menu className="transition-none">
                <Dropdown.Item eventKey="1" onClick={this.onSuccess(true)}>
                  {this.props.processing ? 'Saving ...' : 'Save & Preview'}
                </Dropdown.Item>
                <Dropdown.Item eventKey="2" hidden={!values.id} onClick={this.onDuplicate}>
                  Make a Copy
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="3"
                  onClick={this.props.onReset}
                  hidden={!this.props.onReset || !!(values.id && !this.props.editable)}
                >
                  Refresh
                </Dropdown.Item>
              </Dropdown.Menu>

              <Button
                variant="dark"
                className={classNames('float-right', { 'd-none': !this.props.operation })}
                onClick={this.onDelete}
                size="sm"
                hidden={!!values.id && !this.props.editable}
              >
                Delete Dataset
              </Button>
            </Dropdown>
          </Form>
        )}
      </Formik>
    );
  }

  private getFormGroupClasses(fieldName: string, value?: string | number) {
    return classNames('bmd-form-group', {
      'is-focused': this.state.hasFocus === fieldName,
      'is-filled': value,
    });
  }

  private setFocusedField = ({
    currentTarget,
  }: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this.setState({ hasFocus: currentTarget.name });
  };

  private resetFocus = () => {
    this.setState({ hasFocus: '' });
  };

  private onChange = (setFieldValue: (field: string, value: any) => void) => ({
    currentTarget,
  }: React.FormEvent<any>) => {
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
  };

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
  };

  private onSuccess = (preview = false) => () => this.props.onSuccess(preview);

  private onDelete = () => {
    if (this.props.onDeleteOperation && this.props.operation) {
      this.props.onDeleteOperation(this.props.operation);
    }
  };

  private onDuplicate = () => {
    if (this.props.operation && this.props.onDuplicateOperation) {
      const operation = this.props.operation.withMutations((opn) =>
        opn.delete('id').set('name', `Copy of ${opn.get('name')}`),
      );
      this.props.onDuplicateOperation(operation);
    }
  };
}

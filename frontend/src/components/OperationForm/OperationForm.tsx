import classNames from 'classnames';
import { Formik, FormikProps } from 'formik';
import { fromJS } from 'immutable';
import { debounce } from 'lodash';
import React, { FunctionComponent, useState } from 'react';
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
  previewing?: boolean;
  validating?: boolean;
  onUpdateOperation?: (operation: OperationMap) => void;
  onDeleteOperation?: (operation: OperationMap) => void;
  onSuccess: (preview?: boolean) => void;
  onPreview?: () => void;
  onReset?: () => void;
  onValidate?: () => void;
  children?: React.ReactNode;
}

const schema = Yup.object().shape({
  name: Yup.string().required('Name is required!'),
  description: Yup.string()
    .when('is_draft', {
      is: true,
      then: Yup.string(),
      otherwise: Yup.string().required('Description is required'),
    })
    .nullable(),
  is_draft: Yup.bool(),
});

export const OperationForm: FunctionComponent<OperationFormProps> = (props) => {
  const [hasFocus, setHasFocus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [timeoutId, setTimeoutId] = useState(0);
  const getFormGroupClasses = (fieldName: string, value?: string | number) => {
    return classNames('bmd-form-group', {
      'is-focused': hasFocus === fieldName,
      'is-filled': value,
    });
  };

  const setFocusedField = ({
    currentTarget,
  }: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHasFocus(currentTarget.name);
  };

  const resetFocus = () => {
    setHasFocus('');
  };
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const onChange =
    (setFieldValue: (field: string, value: any) => void) =>
    ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = currentTarget;
      setFieldValue(name, value);
      if (props.onUpdateOperation) {
        if (props.operation) {
          props.onUpdateOperation(props.operation.set(name as keyof Operation, value));
        } else {
          const operation = fromJS({ [name]: value }) as unknown as OperationMap;
          props.onUpdateOperation(operation);
        }
      }
    };
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const toggleDraft =
    (setFieldValue: (field: string, value: any) => void) =>
    ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = currentTarget;
      setFieldValue('is_draft', checked);
      if (props.onUpdateOperation) {
        if (props.operation) {
          const isDraft = !!props.operation.get('is_draft');
          const operation = props.operation.set('is_draft', !isDraft);
          props.onUpdateOperation(operation);
        } else {
          const operation = fromJS({ is_draft: true }) as unknown as OperationMap;
          props.onUpdateOperation(operation);
        }
      }
    };

  const onSuccess =
    (preview = false) =>
    () =>
      props.onSuccess(preview);

  const onDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeoutId(
        window.setTimeout(() => {
          setConfirmDelete(false);
        }, 3000),
      );
    } else {
      if (props.onDeleteOperation && props.operation) {
        props.onDeleteOperation(props.operation);
      }
      setConfirmDelete(false);
      clearTimeout(timeoutId);
    }
  };

  const values: Partial<Operation> = props.operation ? props.operation.toJS() : {};

  return (
    <>
      <Formik
        enableReinitialize={true}
        validationSchema={schema}
        initialValues={values}
        onSubmit={onSuccess()}
        validateOnMount
      >
        {({
          errors,
          isSubmitting,
          isValid,
          setFieldValue,
          handleSubmit,
          submitCount,
        }: FormikProps<Operation>) => (
          <Form className="form" noValidate data-testid="operation-form">
            <Alert variant="danger" hidden={!props.alert}>
              {props.alert}
            </Alert>

            <Form.Group className={getFormGroupClasses('name', values.name)}>
              <Form.Label className="bmd-label-floating">Name</Form.Label>
              <Form.Control
                required
                name="name"
                type="text"
                value={values.name || ''}
                isInvalid={submitCount > 0 && !!errors.name}
                onChange={debounce(onChange(setFieldValue), 1000, { leading: true })}
                onFocus={setFocusedField}
                onBlur={resetFocus}
                disabled={!!values.id && !props.editable}
                data-testid="op-name-field"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name ? errors.name : null}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className={getFormGroupClasses('description', values.description)}>
              <Form.Label className="bmd-label-floating">Description</Form.Label>
              <Form.Control
                name="description"
                as="textarea"
                onChange={debounce(onChange(setFieldValue), 1000, { leading: true })}
                isInvalid={submitCount > 0 && !!errors.description}
                onFocus={setFocusedField}
                onBlur={resetFocus}
                value={values.description ? values.description.toString() : ''}
                disabled={!!values.id && !props.editable}
                data-testid="op-description-field"
              />
              <Form.Control.Feedback type="invalid">
                {errors.description ? errors.description : null}
              </Form.Control.Feedback>
            </Form.Group>

            <CheckBox
              checked={values.is_draft}
              onChange={debounce(toggleDraft(setFieldValue), 1000, { leading: true })}
              label="Is Draft"
              disabled={!!values.id && !props.editable}
            />

            {props.children}

            <Dropdown hidden={!!values.id && !props.editable} data-testid="qb-dropdown-buttons">
              <Button
                variant="danger"
                disabled={!isValid || isSubmitting}
                onClick={() => handleSubmit()}
                size="sm"
                data-testid="qb-save-button"
              >
                {props.processing ? 'Saving ...' : 'Save'}
              </Button>
              <Button
                variant="dark"
                className={classNames({ 'd-none': !props.operation })}
                onClick={props.onPreview}
                size="sm"
                hidden={!props.onPreview}
                disabled={!props.valid}
                data-testid="qb-preview-button"
              >
                {props.previewing ? 'Close Preview' : 'Preview'}
              </Button>
              <Button
                variant="dark"
                className={classNames({ 'd-none': !props.operation })}
                onClick={props.onValidate}
                size="sm"
                hidden={!props.onValidate}
                disabled={!props.valid}
                data-testid="qb-validate-button"
              >
                {props.validating ? 'Validating' : 'Validate'}
              </Button>
              <Dropdown.Toggle
                split
                variant="danger"
                id="operation-form-actions"
                size="sm"
                disabled={!props.valid || !isValid || isSubmitting || props.processing}
                data-testid="qb-dropdown-toggle-button"
              />
              <Dropdown.Menu className="transition-none">
                <Dropdown.Item
                  eventKey="1"
                  onClick={onSuccess(true)}
                  data-testid="qb-save-preview-item"
                >
                  {props.processing ? 'Saving ...' : 'Save & Preview'}
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="3"
                  onClick={props.onReset}
                  hidden={!props.onReset || !!(values.id && !props.editable)}
                  data-testid="qb-refresh-item"
                >
                  Refresh
                </Dropdown.Item>
              </Dropdown.Menu>
              <Button
                variant="dark"
                className={classNames('float-right', { 'd-none': !props.operation })}
                onClick={onDelete}
                size="sm"
                hidden={!!values.id && !props.editable}
                data-testid="qb-delete-button"
              >
                {`${confirmDelete ? 'Confirm ' : ''}Delete Dataset`}
              </Button>
            </Dropdown>
          </Form>
        )}
      </Formik>
    </>
  );
};

OperationForm.defaultProps = {
  valid: true,
  processing: false,
};

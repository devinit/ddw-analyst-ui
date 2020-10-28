import classNames from 'classnames';
import { Formik, FormikProps } from 'formik';
import React, { FunctionComponent, useState } from 'react';
import { Alert, Button, Col, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { Operation } from '../../types/operations';
import { createSavedQueryData } from '../../utils/history';
import { SavedQueryData } from '../DatasetHistoryCard/utils/types';

interface FrozenDataFormProps {
  operation: Operation;
  onSave?: (savedQueryData: SavedQueryData) => void;
  onCancel?: () => void;
}

const schema = Yup.object().shape<Partial<SavedQueryData>>({
  description: Yup.string().required('Message is required!'),
});
const getFormGroupClasses = (value?: string, hasFocus = false) =>
  classNames('bmd-form-group', {
    'is-focused': hasFocus,
    'is-filled': value,
  });

const SavedQueryDataForm: FunctionComponent<FrozenDataFormProps> = ({
  operation,
  onCancel,
  onSave,
}) => {
  const [alert, setAlert] = useState('');
  const [hasFocus, setHasFocus] = useState(false);
  const [canSave, setCanSave] = useState(true);
  const onCreate = (values: Partial<SavedQueryData>) => {
    const savedQueryData: Partial<SavedQueryData> = {
      operation: operation.id,
      active: true,
      description: values.description,
    };
    createSavedQueryData(savedQueryData as SavedQueryData)
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          if (onSave) onSave(response.data);
        } else {
          setAlert(response.statusText);
        }
      })
      .catch((error) => {
        if (error.message === 'Request failed with status code 500') {
          setAlert('Failed to save version. Please try again later.');
        } else if (error.message) {
          setAlert(`Failed to save version. Error: ${error.message}`);
        } else {
          console.log(error);
        }
        setCanSave(false);
      });
  };

  return (
    <Formik validationSchema={schema} onSubmit={onCreate} initialValues={{ description: '' }}>
      {({ errors, handleChange, handleSubmit, values }: FormikProps<Partial<SavedQueryData>>) => {
        return (
          <Form
            className="form"
            noValidate
            onSubmit={handleSubmit}
            data-testid="operation-step-form"
          >
            <Alert variant="danger" hidden={!alert} className="mb-5">
              {alert}
            </Alert>

            <Col>
              <Form.Group className={getFormGroupClasses(values.description, hasFocus)}>
                <Form.Label className="bmd-label-floating">Message</Form.Label>
                <Form.Control
                  required
                  name="description"
                  type="text"
                  onChange={handleChange}
                  defaultValue={''}
                  isInvalid={!!errors.description}
                  onFocus={() => setHasFocus(true)}
                  onBlur={() => setHasFocus(false)}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description ? errors.description : null}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12} className="mt-3">
              <Button
                variant="danger"
                className={classNames('float-right', { 'd-none': !canSave })}
                type="submit"
              >
                Save Current Version
              </Button>
              <Button variant="secondary" className={classNames('float-right')} onClick={onCancel}>
                Cancel
              </Button>
            </Col>
          </Form>
        );
      }}
    </Formik>
  );
};

export { SavedQueryDataForm };

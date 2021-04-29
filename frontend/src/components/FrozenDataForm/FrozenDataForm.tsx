import classNames from 'classnames';
import { Formik, FormikProps } from 'formik';
import React, { FunctionComponent, useState } from 'react';
import { Alert, Button, Col, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { Source } from '../../types/sources';
import { FrozenData } from '../SourceHistoryListItem/utils';
import { createFrozenData } from '../../utils/history';

interface FrozenDataFormProps {
  source: Source;
  onSave?: (frozenData: FrozenData) => void;
  onCancel?: () => void;
}

const schema = Yup.object().shape<Partial<FrozenData>>({
  description: Yup.string().required('Message is required!'),
});
const getFormGroupClasses = (value?: string, hasFocus = false) =>
  classNames('bmd-form-group', {
    'is-focused': hasFocus,
    'is-filled': value,
  });

const FrozenDataForm: FunctionComponent<FrozenDataFormProps> = ({ source, onCancel, onSave }) => {
  const [alert, setAlert] = useState('');
  const [hasFocus, setHasFocus] = useState(false);
  const [canSave, setCanSave] = useState(true);
  const onCreate = (values: Partial<FrozenData>) => {
    const frozenData: Partial<FrozenData> = {
      parent_db_table: source.active_mirror_name as string,
      active: true,
      description: values.description,
    };
    createFrozenData(frozenData as FrozenData)
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
      {({ errors, handleChange, handleSubmit, values }: FormikProps<Partial<FrozenData>>) => {
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
                  data-testid="frozen-data-form-message"
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
                data-testid="frozen-data-form-save-button"
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

export { FrozenDataForm };

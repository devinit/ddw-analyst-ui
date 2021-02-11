import classNames from 'classnames';
import { Formik, FormikProps } from 'formik';
import React, { FunctionComponent, useState } from 'react';
import { Alert, Button, Col, Form } from 'react-bootstrap';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import * as Yup from 'yup';
import {
  AggregateOptions,
  ErroredFilter,
  Filters,
  JoinOptions,
  OperationStep,
  OperationStepMap,
  TransformOptions,
  WindowOptions,
} from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { QueryBuilderHandler } from '../QueryBuilderHandler';
import { isPositionalFunction, isTermFunction } from '../WindowQueryBuilder';

interface OperationStepFormProps {
  source: SourceMap;
  step: OperationStepMap;
  alert?: string;
  editing?: boolean;
  editable?: boolean;
  onSuccess: (step: OperationStepMap) => void;
  onUpdateStep: (step: OperationStepMap, editingStep?: boolean) => void;
  onDeleteStep: (step: OperationStepMap) => void;
  onClose: () => void;
}
const schema = Yup.object().shape({
  step_id: Yup.string().required('Step ID is required!'),
  name: Yup.string().required('Name is required!'),
  query_func: Yup.string().required('Operation is required!'),
});
const queries = [
  { key: 'select', icon: 'check', text: 'Select', value: 'select' },
  { key: 'filter', icon: 'filter', text: 'Filter', value: 'filter' },
  { key: 'join', icon: 'chain', text: 'Join', value: 'join' },
  { key: 'aggregate', icon: 'rain', text: 'Aggregate', value: 'aggregate' },
  { key: 'scalar_transform', icon: 'magic', text: 'Scalar Transform', value: 'scalar_transform' },
  { key: 'multi_transform', icon: 'magic', text: 'Multi Transform', value: 'multi_transform' },
  { key: 'window', icon: 'windows', text: 'Window', value: 'window' },
];

/* eslint-disable @typescript-eslint/naming-convention */
export const OperationStepForm: FunctionComponent<OperationStepFormProps> = (props) => {
  const [alerts, setAlerts] = useState<{ [key: string]: string }>({});
  const [hasFocus, setHasFocus] = useState('');
  const [confirmDeleteStep, setConfirmDeleteStep] = useState(false);
  const [timeoutId, setTimeoutId] = useState(0);

  const getFormGroupClasses = (fieldName: string, value: string | number) => {
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

  const onSelectQuery = (
    data: DropdownProps,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    setFieldValue('query_func', data.value);
    if (data.value) {
      const step = props.step.set('query_func', data.value as string).set('query_kwargs', '');
      props.onUpdateStep(step, props.editing);
    }
    setAlerts({});
  };

  const onSuccess = (step: Partial<OperationStep>) => {
    if (validateStepOptions(props.step)) {
      const query = props.step.get('query_func');
      props.onSuccess(processStep(step, query as string));
    }
  };

  const onUpdateOptions = (options: string) => {
    const step = props.step.set('query_kwargs', options);
    props.onUpdateStep(step, props.editing);
  };

  const validateStepOptions = (step: OperationStepMap) => {
    const query = step.get('query_func');
    if (query === 'filter') {
      return validateFilter(step);
    }
    if (query === 'select') {
      return validateSelect(step);
    }
    if (query === 'join') {
      return validateJoin(step);
    }
    if (query === 'scalar_transform' || query === 'multi_transform') {
      return validateTransform(step);
    }
    if (query === 'aggregate') {
      return validateAggregate(step);
    }
    if (query === 'window') {
      return validateWindow(step);
    }

    return true;
  };

  const validateFilter = (step: OperationStepMap) => {
    const options = step.get('query_kwargs') as string;
    const { filters }: Filters<ErroredFilter[]> = options ? JSON.parse(options) : { filters: [] };
    if (filters.length) {
      let valid = true;
      const updatedFilters = filters.map((filter) => {
        filter.error = {
          field: !filter.field ? 'Column is required' : '',
          func: !filter.func ? 'Operation is required' : '',
          value: !filter.value ? 'Value is required' : '',
        };
        if (filter.error && (filter.error.field || filter.error.func || filter.error.value)) {
          valid = false;
        }

        return filter;
      });

      if (!valid) {
        const updatedStep = step.set('query_kwargs', JSON.stringify({ filters: updatedFilters }));
        props.onUpdateStep(updatedStep, props.editing);
      }

      return valid;
    } else {
      setAlerts({ query_func: 'At least one filter is required!' });

      return false;
    }
  };

  const validateSelect = (step: OperationStepMap) => {
    const options = step.get('query_kwargs') as string;
    const { columns }: { columns: string[] } = options ? JSON.parse(options) : { columns: [] };
    if (columns.length) {
      return true;
    }
    setAlerts({ query_func: 'At least one column is required!' });

    return false;
  };

  const validateJoin = (step: OperationStepMap) => {
    const options = step.get('query_kwargs') as string;
    const { table_name, schema_name, join_on }: JoinOptions = options
      ? JSON.parse(options)
      : { columns: [] };
    const alerts: { [key: string]: string } = {};
    const validateMapping = (key: string) =>
      key === 'column1' || !join_on[key] || join_on[key] === 'column2';
    if (!table_name || !schema_name) {
      alerts.table_name = 'Select a source';
    } else if (join_on && Object.keys(join_on).some(validateMapping)) {
      alerts.join_on = 'Invalid mapping. Make sure that both sides of every mapping are specified';
    } else if (!join_on || Object.keys(join_on).length === 0) {
      alerts.join_on = 'At least one column mapping is required';
    }
    setAlerts(alerts);

    return Object.keys(alerts).length === 0;
  };

  const validateTransform = (step: OperationStepMap) => {
    const options = step.get('query_kwargs') as string;
    const query = step.get('query_func');
    const {
      trans_func_name,
      operational_column,
      operational_columns,
      operational_value,
    }: TransformOptions = options ? JSON.parse(options) : {};
    const alerts: { [key: string]: string } = {};
    if (!trans_func_name) {
      alerts.trans_func_name = 'Transform function is required';
    }
    if (query === 'scalar_transform' && !operational_column) {
      alerts.operational_column = 'Trasform column is required';
    }
    if (query === 'scalar_transform' && !operational_value) {
      alerts.operational_value = 'Value is required';
    }
    if (query === 'multi_transform' && (!operational_columns || operational_columns.length < 2)) {
      alerts.operational_columns = 'At least 2 columns are required';
    }
    setAlerts(alerts);

    return Object.keys(alerts).length === 0;
  };

  const validateAggregate = (step: OperationStepMap) => {
    const options = step.get('query_kwargs') as string;
    const { agg_func_name, operational_column }: AggregateOptions = options
      ? JSON.parse(options)
      : {};
    const alerts: { [key: string]: string } = {};
    if (!agg_func_name) {
      alerts.agg_func_name = 'Aggregate function is required';
    }
    if (!operational_column) {
      alerts.operational_column = 'Aggregate column is required';
    }
    setAlerts(alerts);

    return Object.keys(alerts).length === 0;
  };

  const validateWindow = (step: OperationStepMap) => {
    const options = step.get('query_kwargs') as string;
    const { window_fn, term }: WindowOptions = options ? JSON.parse(options) : {};
    const alerts: { [key: string]: string } = {};
    if (!window_fn) {
      alerts.window_fn = 'Window function is required';
    }
    if ((isTermFunction(window_fn) || isPositionalFunction(window_fn)) && !term) {
      alerts.term = 'Term is required';
    }
    setAlerts(alerts);

    return Object.keys(alerts).length === 0;
  };

  const processStep = (values: Partial<OperationStep>, query: string): OperationStepMap => {
    const options = props.step.get('query_kwargs') as string;
    const source = props.source.get('id') as number;
    let step = props.step;
    if (query === 'filter') {
      const { filters }: Filters<ErroredFilter[]> = options ? JSON.parse(options) : { filters: [] };
      const filtersWithoutErrors = filters.map(({ field, func, value }) => ({
        field,
        func,
        value,
      }));
      step = step.set('query_kwargs', JSON.stringify({ filters: filtersWithoutErrors }));
    }

    return step.withMutations((_step) =>
      _step
        .set('name', values.name || '')
        .set('description', values.description || '')
        .set('step_id', values.step_id || '')
        .set('query_func', values.query_func || '')
        .set('source', source || ''),
    );
  };

  const onDeleteStep = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.preventDefault();
    if (!confirmDeleteStep) {
      setConfirmDeleteStep(true);
      setTimeoutId(
        window.setTimeout(() => {
          setConfirmDeleteStep(false);
        }, 3000),
      );
    } else {
      props.onDeleteStep(props.step);
      setConfirmDeleteStep(false);
      clearTimeout(timeoutId);
    }
  };

  return (
    <Formik validationSchema={schema} initialValues={props.step.toJS()} onSubmit={onSuccess}>
      {({
        errors,
        handleChange,
        handleSubmit,
        values,
        setFieldValue,
      }: FormikProps<OperationStep>) => {
        errors = { ...errors, ...alerts };

        return (
          <Form
            className="form"
            noValidate
            onSubmit={handleSubmit}
            data-testid="operation-step-form"
          >
            <Alert variant="danger" hidden={!props.alert}>
              {props.alert}
            </Alert>

            <Col md={3}>
              <Form.Group className={getFormGroupClasses('step_id', values.step_id)}>
                <Form.Label className="bmd-label-floating">Step ID</Form.Label>
                <Form.Control
                  required
                  name="step_id"
                  type="number"
                  disabled
                  defaultValue={values.step_id ? values.step_id.toString() : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.step_id ? errors.step_id : null}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={8}>
              <Form.Group className={getFormGroupClasses('name', values.name)}>
                <Form.Label className="bmd-label-floating">Name</Form.Label>
                <Form.Control
                  name="name"
                  type="text"
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                  onFocus={setFocusedField}
                  onBlur={resetFocus}
                  defaultValue={values.name ? values.name.toString() : ''}
                  disabled={!props.editable}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name ? errors.name : null}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={10}>
              <Form.Group className={getFormGroupClasses('description', values.description)}>
                <Form.Label className="bmd-label-floating">Description</Form.Label>
                <Form.Control
                  name="description"
                  as="textarea"
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                  onFocus={setFocusedField}
                  onBlur={resetFocus}
                  defaultValue={values.description ? values.description.toString() : ''}
                  disabled={!props.editable}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description ? errors.description : null}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={5} className="mt-2">
              <Form.Group>
                <Form.Label className="bmd-label-floating">Query</Form.Label>
                <Dropdown
                  placeholder="Select Query"
                  fluid
                  options={queries}
                  selection
                  defaultValue={values.query_func}
                  onChange={(
                    _event: React.SyntheticEvent<HTMLElement, Event>,
                    data: DropdownProps,
                  ) => onSelectQuery(data, setFieldValue)}
                  disabled={!props.editable}
                />
                <Form.Control.Feedback
                  type="invalid"
                  className={classNames({ 'd-block': !!(errors && errors.query_func) })}
                >
                  {errors.query_func ? errors.query_func : null}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={12} className="mt-3">
              <QueryBuilderHandler
                source={props.source}
                step={props.step}
                alerts={alerts}
                onUpdateOptions={onUpdateOptions}
                editable={props.editable}
              />
            </Col>

            <Col md={12} className="mt-3">
              <Button variant="dark" hidden={!props.onClose} size="sm" onClick={props.onClose}>
                Close
              </Button>
              <Button
                variant="dark"
                className={classNames({ 'd-none': !props.editing })}
                type="submit"
                onClick={onDeleteStep}
                hidden={!props.editable}
                size="sm"
              >
                {`${confirmDeleteStep ? 'Confirm ' : ''}Delete Step`}
              </Button>
              <Button variant="danger" type="submit" hidden={!props.editable} size="sm">
                {props.editing ? 'Edit Step' : 'Save Step'}
              </Button>
            </Col>
          </Form>
        );
      }}
    </Formik>
  );
};

OperationStepForm.defaultProps = {
  editable: true,
};

import classNames from 'classnames';
import { Formik, FormikProps } from 'formik';
import * as React from 'react';
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
  TransformOptions
} from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { QueryBuilderHandler } from '../QueryBuilderHandler';

interface OperationStepFormState {
  alerts: { [key: string]: string };
  hasFocus: string;
}

interface OperationStepFormProps {
  source: SourceMap;
  step: OperationStepMap;
  alert?: string;
  editing?: boolean;
  editable?: boolean;
  onSuccess: (step: OperationStepMap) => void;
  onUpdateStep: (step: OperationStepMap, editingStep?: boolean) => void;
  onDeleteStep: (step: OperationStepMap) => void;
}

export class OperationStepForm extends React.Component<OperationStepFormProps, OperationStepFormState> {
  static defaultProps: Partial<OperationStepFormProps> = {
    editable: true
  };
  state: OperationStepFormState = {
    alerts: {},
    hasFocus: ''
  };
  private schema = Yup.object().shape({
    step_id: Yup.string().required('Step ID is required!'),
    name: Yup.string().required('Name is required!'),
    query_func: Yup.string().required('Operation is required!')
  });
  private queries = [
    { key: 'select', icon: 'check', text: 'Select', value: 'select' },
    { key: 'filter', icon: 'filter', text: 'Filter', value: 'filter' },
    { key: 'join', icon: 'chain', text: 'Join', value: 'join' },
    { key: 'aggregate', icon: 'rain', text: 'Aggregate', value: 'aggregate' },
    { key: 'scalar_transform', icon: 'magic', text: 'Scalar Transform', value: 'scalar_transform' },
    { key: 'multi_transform', icon: 'magic', text: 'Multi Transform', value: 'multi_transform' }
  ];

  render() {
    const initialValues: Partial<OperationStep> = this.props.step.toJS();

    return (
      <Formik validationSchema={ this.schema } initialValues={ initialValues } onSubmit={ this.onSuccess }>
        {
          ({ errors, handleChange, handleSubmit, values, setFieldValue }: FormikProps<OperationStep>) => {
            errors = { ...errors, ...this.state.alerts };

            return (
              <Form className="form" noValidate onSubmit={ handleSubmit } data-testid="operation-step-form">
                <Alert variant="danger" hidden={ !this.props.alert }>
                  { this.props.alert }
                </Alert>

                <Col md={ 3 }>
                  <Form.Group className={ this.getFormGroupClasses('step_id', values.step_id) }>
                    <Form.Label className="bmd-label-floating">Step ID</Form.Label>
                    <Form.Control
                      required
                      name="step_id"
                      type="number"
                      disabled
                      defaultValue={ values.step_id ? values.step_id.toString() : '' }
                    />
                    <Form.Control.Feedback type="invalid">
                      { errors.step_id ? errors.step_id : null }
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={ 8 }>
                  <Form.Group className={ this.getFormGroupClasses('name', values.name) }>
                    <Form.Label className="bmd-label-floating">Name</Form.Label>
                    <Form.Control
                      name="name"
                      type="text"
                      onChange={ handleChange }
                      isInvalid={ !!errors.name }
                      onFocus={ this.setFocusedField }
                      onBlur={ this.resetFocus }
                      defaultValue={ values.name ? values.name.toString() : '' }
                      disabled={ !this.props.editable }
                    />
                    <Form.Control.Feedback type="invalid">
                      { errors.name ? errors.name : null }
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={ 10 }>
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
                      disabled={ !this.props.editable }
                    />
                    <Form.Control.Feedback type="invalid">
                      { errors.description ? errors.description : null }
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={ 5 } className="mt-2">
                  <Form.Group>
                    <Form.Label className="bmd-label-floating">Query</Form.Label>
                    <Dropdown
                      placeholder="Select Query"
                      fluid
                      options={ this.queries }
                      selection
                      defaultValue={ values.query_func }
                      onChange={ (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) =>
                        this.onSelectQuery(data, setFieldValue)
                      }
                      disabled={ !this.props.editable }
                    />
                    <Form.Control.Feedback
                      type="invalid"
                      className={ classNames({ 'd-block': !!(errors && errors.query_func) }) }
                    >
                      { errors.query_func ? errors.query_func : null }
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={ 12 } className="mt-3">
                  <QueryBuilderHandler
                    source={ this.props.source }
                    step={ this.props.step }
                    alerts={ this.state.alerts }
                    onUpdateOptions={ this.onUpdateOptions }
                    editable={ this.props.editable }
                  />
                </Col>

                <Col md={ 12 } className="mt-3">
                  <Button variant="danger" className="float-right" type="submit">
                    { this.props.editing ? 'Edit Step' : 'Add Step' }
                  </Button>
                  <Button
                    variant="secondary"
                    className={ classNames('float-right', { 'd-none': !this.props.editing }) }
                    type="submit"
                    onClick={ () => this.props.onDeleteStep(this.props.step) }
                  >
                    <i className="material-icons">delete</i>
                  </Button>
                </Col>
              </Form>
            );
          }
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

  private onSelectQuery = (data: DropdownProps, setFieldValue: (field: string, value: any) => void) => {
    setFieldValue('query_func', data.value);
    if (data.value) {
      const step = this.props.step.set('query_func', data.value as string).set('query_kwargs', '');
      this.props.onUpdateStep(step, this.props.editing);
    }
    this.setState({ alerts: {} });
  }

  private onSuccess = (step: Partial<OperationStep>) => {
    if (this.validateStepOptions(this.props.step)) {
      const query = this.props.step.get('query_func');
      this.props.onSuccess(this.processStep(step, query as string));
    }
  }

  private onUpdateOptions = (options: string) => {
    const step = this.props.step.set('query_kwargs', options);
    this.props.onUpdateStep(step, this.props.editing);
  }

  private validateStepOptions(step: OperationStepMap) {
    const query = step.get('query_func');
    if (query === 'filter') {
      return this.validateFilter(step);
    }
    if (query === 'select') {
      return this.validateSelect(step);
    }
    if (query === 'join') {
      return this.validateJoin(step);
    }
    if (query === 'scalar_transform' || query === 'multi_transform') {
      return this.validateTransform(step);
    }
    if (query === 'aggregate') {
      return this.validateAggregate(step);
    }
    return true;
  }

  private validateFilter(step: OperationStepMap) {
    const options = step.get('query_kwargs') as string;
    const { filters }: Filters<ErroredFilter[]> = options ? JSON.parse(options) : { filters: [] };
    if (filters.length) {
      let valid = true;
      const updatedFilters = filters.map(filter => {
        filter.error = {
          field: !filter.field ? 'Column is required' : '',
          func: !filter.func ? 'Operation is required' : '',
          value: !filter.value ? 'Value is required' : ''
        };
        if (filter.error && (filter.error.field || filter.error.func || filter.error.value)) {
          valid = false;
        }

        return filter;
      });

      if (!valid) {
        const updatedStep = step.set('query_kwargs', JSON.stringify({ filters: updatedFilters }));
        this.props.onUpdateStep(updatedStep, this.props.editing);
      }

      return valid;
    } else {
      this.setState({ alerts: { query_func: 'At least one filter is required!' } });

      return false;
    }
  }

  private validateSelect(step: OperationStepMap) {
    const options = step.get('query_kwargs') as string;
    const { columns }: { columns: string[] } = options ? JSON.parse(options) : { columns: [] };
    if (columns.length) {
      return true;
    }
    this.setState({ alerts: { query_func: 'At least one column is required!' } });

    return false;
  }

  private validateJoin(step: OperationStepMap) {
    const options = step.get('query_kwargs') as string;
    const { table_name, schema_name, join_on }: JoinOptions = options ? JSON.parse(options) : { columns: [] };
    const alerts: { [ key: string ]: string } = {};
    const validateMapping = (key: string) => key === 'column1' || !join_on[key] || join_on[key] === 'column2';
    if (!table_name || !schema_name) {
      alerts.table_name = 'Select a source';
    } else if (join_on && Object.keys(join_on).some(validateMapping)) {
      alerts.join_on = 'Invalid mapping. Make sure that both sides of every mapping are specified';
    } else if (!join_on || Object.keys(join_on).length === 0) {
      alerts.join_on = 'At least one column mapping is required';
    }
    this.setState({ alerts });

    return Object.keys(alerts).length === 0;
  }

  private validateTransform(step: OperationStepMap) {
    const options = step.get('query_kwargs') as string;
    const query = step.get('query_func');
    const { trans_func_name, operational_column, operational_columns, operational_value }: TransformOptions = options
      ? JSON.parse(options)
      : {};
    const alerts: { [ key: string ]: string } = {};
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
    this.setState({ alerts });

    return Object.keys(alerts).length === 0;
  }

  private validateAggregate(step: OperationStepMap) {
    const options = step.get('query_kwargs') as string;
    const { agg_func_name, operational_column }: AggregateOptions = options ? JSON.parse(options) : {};
    const alerts: { [ key: string ]: string } = {};
    if (!agg_func_name) {
      alerts.agg_func_name = 'Aggregate function is required';
    }
    if (!operational_column) {
      alerts.operational_column = 'Aggregate column is required';
    }
    this.setState({ alerts });

    return Object.keys(alerts).length === 0;
  }

  private processStep(values: Partial<OperationStep>, query: string): OperationStepMap {
    const options = this.props.step.get('query_kwargs') as string;
    const source = this.props.source.get('id') as number;
    let step = this.props.step;
    if (query === 'filter') {
      const { filters }: Filters<ErroredFilter[]> = options ? JSON.parse(options) : { filters: [] };
      const filtersWithoutErrors = filters.map(({ field, func, value }) => ({ field, func, value }));
      step = step.set('query_kwargs', JSON.stringify({ filters: filtersWithoutErrors }));
    }

    return step.withMutations(_step => _step
      .set('name', values.name || '')
      .set('description', values.description || '')
      .set('step_id', values.step_id || '')
      .set('query_func', values.query_func || '')
      .set('source', source || '')
    );
  }
}

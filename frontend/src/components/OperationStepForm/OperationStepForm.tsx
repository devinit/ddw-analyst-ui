import classNames from 'classnames';
import { Formik, FormikErrors, FormikProps } from 'formik';
import { fromJS } from 'immutable';
import * as React from 'react';
import { Alert, Button, Col, Form } from 'react-bootstrap';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import * as Yup from 'yup';
import { ErroredFilter, Filters, OperationStep, OperationStepMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import FilterQueryBuilder from '../FilterQueryBuilder';

interface OperationStepFormState {
  alerts: FormikErrors<OperationStep>;
  hasFocus: string;
}

interface OperationStepFormProps {
  source: SourceMap;
  step: OperationStepMap;
  alert?: string;
  onSuccess: (step: OperationStepMap) => void;
  onUpdateStep: (step: OperationStepMap) => void;
}

export class OperationStepForm extends React.Component<OperationStepFormProps, OperationStepFormState> {
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
    { key: 'filter', icon: 'filter', text: 'Filter', value: 'filter' },
    { key: 'join', icon: 'chain', text: 'Join', value: 'join' },
    { key: 'aggregate', icon: 'rain', text: 'Aggregate', value: 'aggregate' },
    { key: 'transform', icon: 'magic', text: 'Transform', value: 'transform' }
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
                    />
                    <Form.Control.Feedback type="invalid">
                      { errors.description ? errors.description : null }
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={ 5 } className="mt-2">
                  <Dropdown
                    placeholder="Select Query"
                    fluid
                    options={ this.queries }
                    selection
                    defaultValue={ values.query_func }
                    onChange={ this.onSelectQuery(setFieldValue) }
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    className={ classNames({ 'd-block': !!(errors && errors.query_func) }) }
                  >
                    { errors.query_func ? errors.query_func : null }
                  </Form.Control.Feedback>
                </Col>

                <Col md={ 12 } className="mt-3">
                  { this.renderSpecificQueryBuilder(this.props.source, this.props.step) }
                </Col>

                <Col md={ 12 } className="mt-3">
                  <Button variant="danger" className="float-right" type="submit">Add Operation</Button>
                </Col>
              </Form>
            );
          }
        }
      </Formik>
    );
  }

  private renderSpecificQueryBuilder(source: SourceMap, step: OperationStepMap) {
    const query = step.get('query_func');
    if (query === 'filter') {
      const options = step.get('query_kwargs') as string;
      const { filters }: Filters = options ? JSON.parse(options) : { filters: [] };

      return (
        <FilterQueryBuilder source={ source } filters={ fromJS(filters) } onUpdateFilters={ this.onUpdateOptions }/>
      );
    }
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

  private onSelectQuery = (setFieldValue: (field: string, value: any) => void) =>
    (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
      setFieldValue('query_func', data.value);
      if (data.value) {
        const step = this.props.step.set('query_func', data.value as string);
        this.props.onUpdateStep(step);
      }
    }

  private onSuccess = (values: Partial<OperationStep>) => {
    if (this.validateStepOptions(this.props.step)) {
      const query = this.props.step.get('query_func');
      if (query === 'filter') {
        this.props.onSuccess(this.processFilter(values));
      }
    }
  }

  private onUpdateOptions = (options: string) => {
    const step = this.props.step.set('query_kwargs', options);
    this.props.onUpdateStep(step);
  }

  private validateStepOptions(step: OperationStepMap) {
    const query = step.get('query_func');
    if (query === 'filter') {
      return this.validateFilter(step);
    }
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
        this.props.onUpdateStep(updatedStep);
      }

      return valid;
    } else {
      this.setState({ alerts: { query_func: 'At least one filter is required!' } });

      return false;
    }
  }

  private processFilter(values: Partial<OperationStep>): OperationStepMap {
    const options = this.props.step.get('query_kwargs') as string;
    const { filters }: Filters<ErroredFilter[]> = options ? JSON.parse(options) : { filters: [] };
    const filtersWithoutErrors = filters.map(({ field, func, value }) => ({ field, func, value }));

    return this.props.step.withMutations(step => step
      .set('query_kwargs', JSON.stringify({ filters: filtersWithoutErrors }))
      .set('name', values.name || '')
      .set('description', values.description || '')
      .set('step_id', values.step_id || '')
      .set('query_func', values.query_func || '')
    );
  }
}

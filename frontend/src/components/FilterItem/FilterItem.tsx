import classNames from 'classnames';
import { debounce } from 'lodash';
import React, { FunctionComponent, useState } from 'react';
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { FormControlElement } from '../../types/bootstrap';
import { ErroredFilterMap, Filter, FilterMap } from '../../types/operations';

interface FilterItemProps {
  columns: DropdownItemProps[];
  operations: DropdownItemProps[];
  filter: ErroredFilterMap;
  onAdd?: (filter: ErroredFilterMap) => void;
  onUpdate?: (filter: ErroredFilterMap) => void;
  onDelete?: (filter: ErroredFilterMap) => void;
  onDuplicateFilter?: (filter: ErroredFilterMap) => void;
  errors?: { [P in keyof Filter]?: string };
  editable?: boolean;
}

export const FilterItem: FunctionComponent<FilterItemProps> = (props) => {
  const [hasFocus, setHasFocus] = useState('');

  const onSelectColumn = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
    if (data.value && props.onUpdate) {
      const filter = props.filter.set('field', data.value as string);
      props.onUpdate(filter);
    }
  };

  const onSelectOperation = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
    if (data.value && props.onUpdate) {
      const filter = props.filter.set('func', data.value as string);
      props.onUpdate(filter);
    }
  };

  const onChangeValue = ({ currentTarget }: React.ChangeEvent<FormControlElement>) => {
    if (props.onUpdate) {
      const filter = props.filter.set('value', currentTarget.value);
      props.onUpdate(filter);
    }
  };

  const getFormGroupClasses = (fieldName: string, value: string | number, hasError = false) => {
    return classNames('bmd-form-group', {
      'is-focused': hasFocus === fieldName,
      'is-filled': value,
      'has-danger': hasError,
    });
  };

  const setFocusedField = ({ currentTarget }: React.FocusEvent<HTMLInputElement>) => {
    setHasFocus(currentTarget.name);
  };

  const resetFocus = () => {
    setHasFocus('');
  };

  const onDelete = () => {
    if (props.onDelete) props.onDelete(props.filter);
  };
  const onDuplicateFilter = () => {
    if (props.onDuplicateFilter) props.onDuplicateFilter(props.filter);
  };
  const onAdd = () => {
    if (props.onAdd) props.onAdd(props.filter);
  };

  const { columns, filter, operations } = props;
  const errors = filter.get('error') as FilterMap | undefined;

  return (
    <Row className="mb-1">
      <Col lg={4} className="my-2">
        <Dropdown
          placeholder="Select Column"
          fluid
          selection
          search
          options={columns}
          onChange={onSelectColumn}
          value={filter.get('field') as string}
          error={!!(errors && errors.get('field'))}
          disabled={!props.editable}
          data-testid="qb-filter-select-column"
        />
        <Form.Control.Feedback
          type="invalid"
          className={classNames({ 'd-block': !!(errors && errors.get('field')) })}
        >
          {errors && errors.get('field')}
        </Form.Control.Feedback>
      </Col>

      <Col lg={4} className="my-2">
        <Dropdown
          placeholder="Select Operation"
          fluid
          selection
          search
          options={operations}
          onChange={onSelectOperation}
          value={filter.get('func') as string}
          error={!!(errors && errors.get('func'))}
          disabled={!props.editable}
          data-testid="qb-filter-select-operation"
        />
        <Form.Control.Feedback
          type="invalid"
          className={classNames({ 'd-block': !!(errors && errors.get('func')) })}
        >
          {errors && errors.get('func')}
        </Form.Control.Feedback>
      </Col>

      <Col lg={3}>
        <Form.Group
          className={getFormGroupClasses(
            'value',
            filter.get('value') as string,
            !!(errors && errors.get('value')),
          )}
        >
          <Form.Label className="bmd-label-floating">Value</Form.Label>
          <FormControl
            name="value"
            defaultValue={filter.get('value') as string}
            value={filter.get('value') as string}
            isInvalid={!!(errors && errors.get('value'))}
            onFocus={setFocusedField}
            onBlur={resetFocus}
            onChange={debounce(onChangeValue, 1000, { leading: true })}
            disabled={!props.editable}
            data-testid="qb-filter-value"
          />
          <Form.Control.Feedback
            type="invalid"
            className={classNames({ 'd-block': !!(errors && errors.get('value')) })}
          >
            {errors && errors.get('value')}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col lg={1}>
        <Row>
          {props.onAdd ? (
            <Button
              variant="link"
              className="btn-just-icon"
              onClick={onAdd}
              hidden={!props.editable}
              data-testid="qb-filter-add-button"
            >
              <i className="material-icons">add</i>
            </Button>
          ) : null}
          {props.onDelete ? (
            <Button
              variant="link"
              className="btn-just-icon"
              onClick={onDelete}
              hidden={!props.editable}
              data-testid="qb-filter-delete-button"
            >
              <i className="material-icons">delete</i>
            </Button>
          ) : null}
          {props.onDuplicateFilter ? (
            <Button
              title="Copy"
              className="btn-just-icon"
              variant="link"
              data-testid="qb-filter-duplicate-button"
              onClick={onDuplicateFilter}
            >
              <i className="material-icons">content_copy</i>
            </Button>
          ) : null}
        </Row>
      </Col>
    </Row>
  );
};

FilterItem.defaultProps = { editable: true };

export default FilterItem;

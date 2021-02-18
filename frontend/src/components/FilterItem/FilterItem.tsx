import classNames from 'classnames';
import { debounce } from 'lodash';
import * as React from 'react';
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { ErroredFilterMap, Filter, FilterMap } from '../../types/operations';

interface FilterItemProps {
  columns: DropdownItemProps[];
  operations: DropdownItemProps[];
  filter: ErroredFilterMap;
  onUpdate: (filter: ErroredFilterMap) => void;
  onDelete: (filter: ErroredFilterMap) => void;
  errors?: { [P in keyof Filter]?: string };
  editable?: boolean;
}

interface FilterItemState {
  hasFocus: string;
}

export class FilterItem extends React.Component<FilterItemProps, FilterItemState> {
  static defaultProps: Partial<FilterItemProps> = { editable: true };
  state: FilterItemState = { hasFocus: '' };

  render() {
    const { columns, filter, operations } = this.props;
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
            onChange={this.onSelectColumn}
            defaultValue={filter.get('field') as string}
            error={!!(errors && errors.get('field'))}
            disabled={!this.props.editable}
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
            onChange={this.onSelectOperation}
            defaultValue={this.props.filter.get('func') as string}
            error={!!(errors && errors.get('func'))}
            disabled={!this.props.editable}
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
            className={this.getFormGroupClasses(
              'value',
              filter.get('value') as string,
              !!(errors && errors.get('value')),
            )}
          >
            <Form.Label className="bmd-label-floating">Value</Form.Label>
            <FormControl
              name="value"
              defaultValue={filter.get('value') as string}
              isInvalid={!!(errors && errors.get('value'))}
              onFocus={this.setFocusedField}
              onBlur={this.resetFocus}
              onChange={debounce(this.onChangeValue, 1000, { leading: true })}
              disabled={!this.props.editable}
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
          <Button
            variant="link"
            className="btn-just-icon"
            onClick={this.onDelete}
            hidden={!this.props.editable}
            data-testid="qb-filter-delete-button"
          >
            <i className="material-icons">delete</i>
          </Button>
        </Col>
      </Row>
    );
  }

  private onSelectColumn = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
    if (data.value) {
      const filter = this.props.filter.set('field', data.value as string);
      this.props.onUpdate(filter);
    }
  };

  private onSelectOperation = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
    if (data.value) {
      const filter = this.props.filter.set('func', data.value as string);
      this.props.onUpdate(filter);
    }
  };

  private onChangeValue = ({ currentTarget }: React.FormEvent<any>) => {
    const filter = this.props.filter.set('value', currentTarget.value);
    this.props.onUpdate(filter);
  };

  private getFormGroupClasses(fieldName: string, value: string | number, hasError = false) {
    return classNames('bmd-form-group', {
      'is-focused': this.state.hasFocus === fieldName,
      'is-filled': value,
      'has-danger': hasError,
    });
  }

  private setFocusedField = ({ currentTarget }: React.FocusEvent<HTMLInputElement>) => {
    this.setState({ hasFocus: currentTarget.name });
  };

  private resetFocus = () => {
    this.setState({ hasFocus: '' });
  };

  private onDelete = () => {
    this.props.onDelete(this.props.filter);
  };
}

export default FilterItem;

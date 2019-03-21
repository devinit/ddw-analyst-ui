import classNames from 'classnames';
import * as React from 'react';
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { Filter, FilterMap } from '../../types/query-builder';

interface FilterItemProps {
  columns: DropdownItemProps[];
  operations: DropdownItemProps[];
  filter: FilterMap;
  onUpdate: (filter: FilterMap) => void;
  onDelete: (filter: FilterMap) => void;
  errors?: { [P in keyof Filter]?: string };
}

interface FilterItemState {
  hasFocus: string;
}

export class FilterItem extends React.Component<FilterItemProps, FilterItemState> {
  state: FilterItemState = { hasFocus: '' };

  render() {
    const { columns, errors, filter, operations } = this.props;

    return (
      <Row className="mb-1">
        <Col lg={ 4 } className="my-2">
          <Dropdown
            placeholder="Select Column"
            fluid
            selection
            search
            options={ columns }
            onChange={ this.onSelectColumn }
            defaultValue={ filter.get('field') }
            error={ !!(errors && errors.field) }
          />
          <Form.Control.Feedback type="invalid" className={ classNames({ 'd-block': !!(errors && errors.field) }) }>
            { errors && errors.field }
          </Form.Control.Feedback>
        </Col>

        <Col lg={ 4 } className="my-2">
          <Dropdown
            placeholder="Select Operation"
            fluid
            selection
            search
            options={ operations }
            defaultValue={ this.props.filter.get('func') }
            error={ !!(errors && errors.func) }
          />
          <Form.Control.Feedback type="invalid" className={ classNames({ 'd-block': !!(errors && errors.func) }) }>
            { errors && errors.func }
          </Form.Control.Feedback>
        </Col>

        <Col lg={ 3 }>
          <Form.Group
            className={ this.getFormGroupClasses('value', filter.get('value') as string, !!(errors && errors.func)) }
          >
            <Form.Label className="bmd-label-floating">Value</Form.Label>
            <FormControl
              name="value"
              defaultValue={ filter.get('value') as string }
              isInvalid={ !!(errors && errors.value) }
              onFocus={ this.setFocusedField }
              onBlur={ this.resetFocus }
            />
            <Form.Control.Feedback type="invalid" className={ classNames({ 'd-block': !!(errors && errors.value) }) }>
              { errors && errors.value }
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col lg={ 1 }>
          <Button variant="link" className="btn-just-icon" onClick={ this.onDelete }>
            <i className="material-icons">delete</i>
          </Button>
        </Col>
      </Row>
    );
  }

  private onSelectColumn = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    if (data.value) {
      const filter = this.props.filter.set('field', data.value as string);
      this.props.onUpdate(filter);
    }
  }

  private getFormGroupClasses(fieldName: string, value: string | number, hasError = false) {
    return classNames('bmd-form-group', {
      'is-focused': this.state.hasFocus === fieldName,
      'is-filled': value,
      'has-danger': hasError
    });
  }

  private setFocusedField = ({ currentTarget }: React.FocusEvent<HTMLInputElement>) => {
    this.setState({ hasFocus: currentTarget.name });
  }

  private resetFocus = () => {
    this.setState({ hasFocus: '' });
  }

  private onDelete = () => {
    this.props.onDelete(this.props.filter);
  }
}

export default FilterItem;

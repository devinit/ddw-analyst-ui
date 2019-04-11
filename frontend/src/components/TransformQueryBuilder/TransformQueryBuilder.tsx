import classNames from 'classnames';
import * as React from 'react';
import { Col, Form } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { ColumnList, SourceMap } from '../../types/sources';

interface TransformQueryBuilderProps {
  multi?: boolean;
  source: SourceMap;
  columns?: string[];
  function?: string;
  column?: string;
  value?: string;
  onUpdate?: (options: string) => void;
}

export class TransformQueryBuilder extends React.Component<TransformQueryBuilderProps, { hasFocus: string }> {
  private scalarFunctions = [
    { key: 'add', text: 'Add', value: 'add' },
    { key: 'multiply', text: 'Multiply', value: 'multiply' },
    { key: 'power', text: 'Power', value: 'power' },
    { key: 'subtract', text: 'Subtract', value: 'subtract' },
    { key: 'divide', text: 'Divide', value: 'divide' },
    { key: 'concat', text: 'Concatanate', value: 'concat' },
    { key: 'text_search', text: 'Text Search', value: 'text_search' }
  ];
  private multiFunctions = [
    { key: 'sum', text: 'Add', value: 'sum' },
    { key: 'product', text: 'Multiply', value: 'product' }
  ];
  state = { hasFocus: '' };

  render() {
    const columns = this.props.source.get('columns') as ColumnList;

    return (
      <React.Fragment>

        <Col md={ 5 } className="mt-2 pl-0">
          <Form.Group>
            <Form.Label className="bmd-label-floating">Transform Function</Form.Label>
            <Dropdown
              name="trans_func_name"
              placeholder="Select Function"
              fluid
              search
              selection
              options={ this.props.multi ? this.multiFunctions : this.scalarFunctions }
              value={ this.props.function }
              onChange={ this.onSelectChange }
            />
          </Form.Group>
        </Col>

        <Col md={ this.props.multi ? 12 : 5 } className={ classNames('mt-2 pl-0', { 'd-none': !this.props.function }) }>
          <Form.Group>
            <Form.Label className="bmd-label-floating">On</Form.Label>
            <Dropdown
              name={ this.props.multi ? 'operational_columns' : 'operational_column' }
              placeholder={ this.props.multi ? 'Select Columns' : 'Select Column' }
              multiple={ this.props.multi }
              fluid
              search
              selection
              options={ this.getSelectOptionsFromColumns(columns, this.props.function) }
              value={ this.props.multi ? this.props.columns : this.props.column }
              onChange={ this.onSelectChange }
            />
          </Form.Group>
        </Col>

        <Col md={ 7 } className={ classNames('mt-2 pl-0', { 'd-none': !this.props.function }) }>
          <Form.Group
            hidden={ this.props.multi }
            className={ this.getFormGroupClasses('operational_value', this.props.value || '') }
          >
            <Form.Label className="bmd-label-floating">Value</Form.Label>
            <Form.Control
              name="operational_value"
              type={ this.props.function && this.isNumerical(this.props.function) ? 'number' : 'text' }
              onChange={ this.onTextChange }
              onFocus={ this.setFocusedField }
              onBlur={ this.resetFocus }
              defaultValue={ this.props.value }
            />
          </Form.Group>
        </Col>
      </React.Fragment>
    );
  }

  private getFormGroupClasses(fieldName: string, value: string | number) {
    return classNames('bmd-form-group', {
      'is-focused': this.state.hasFocus === fieldName,
      'is-filled': value
    });
  }

  private isNumerical(functn: string) {
    return functn !== 'text_search' && functn !== 'concat';
  }

  private getSelectOptionsFromColumns(columns: ColumnList, functn?: string): DropdownItemProps[] {
    if (columns.count()) {
      if (functn) {
        const dataType: 'N' | 'C' = this.isNumerical(functn) ? 'N' : 'C';
        columns = columns.filter(column => column.get('data_type') === dataType);
      }

      return columns.map(column => ({
        key: column.get('id'),
        text: column.get('source_name'),
        value: column.get('name')
      })).toJS();
    }

    return [];
  }

  private onSelectChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    if (this.props.onUpdate) {
      const { name, value } = data;
      if (this.props.multi) {
        const { function: func, columns } = this.props;
        const options = { trans_func_name: func, operational_columns: columns };
        this.props.onUpdate(JSON.stringify({ ...options, [name]: value }));
      } else {
        const { function: func, column, value: operational_value } = this.props;
        const options = { operational_value, trans_func_name: func, operational_column: column };
        this.props.onUpdate(JSON.stringify({ ...options, [name]: value }));
      }
    }
  }

  private onTextChange = (event: React.FormEvent<any>) => {
    if (this.props.onUpdate) {
      const { name, value } = event.currentTarget;
      const { function: func, column, value: operational_value } = this.props;
      const options = { operational_value, trans_func_name: func, operational_column: column };
      this.props.onUpdate(JSON.stringify({ ...options, [name]: value }));
    }
  }

  private setFocusedField = ({ currentTarget }: React.FocusEvent<HTMLInputElement>) => {
    this.setState({ hasFocus: currentTarget.name });
  }

  private resetFocus = () => {
    this.setState({ hasFocus: '' });
  }
}

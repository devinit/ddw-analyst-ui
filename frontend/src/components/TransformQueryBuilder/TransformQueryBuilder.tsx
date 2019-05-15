import classNames from 'classnames';
import * as React from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { ColumnList, SourceMap } from '../../types/sources';
import { formatString } from '../../utils';
import { TransformOptions } from '../../types/operations';

type Alerts = { [P in keyof TransformOptions ]: string };
interface TransformQueryBuilderProps {
  alerts?: Partial<Alerts>;
  multi?: boolean;
  source: SourceMap;
  columns?: string[];
  function?: string;
  column?: string;
  value?: string;
  editable?: boolean;
  onUpdate?: (options: string) => void;
}

interface TransformQueryBuilderState {
  showInfo: boolean;
  hasFocus: string;
}

export class TransformQueryBuilder extends React.Component<TransformQueryBuilderProps, TransformQueryBuilderState> {
  static defaultProps: Partial<TransformQueryBuilderProps> = {
    alerts: {},
    editable: true
  };

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
    { key: 'product', text: 'Multiply', value: 'product' },
    { key: 'divide', text: 'Divide', value: 'divide' },
    { key: 'concat', text: 'Concatanate', value: 'concat' }
  ];
  state = { hasFocus: '', showInfo: false };

  render() {
    const columns = this.props.source.get('columns') as ColumnList;
    const { alerts, multi } = this.props;
    const columnAlert = alerts && (multi ? alerts.operational_columns : alerts.operational_column);

    return (
      <React.Fragment>

        <Col md={ 5 } className="mt-2 pl-0">
          <Form.Group>
            <Form.Label className="bmd-label-floating">Transform Function</Form.Label>
            <Row>
              <Col md={ 10 }>
                <Dropdown
                  name="trans_func_name"
                  placeholder="Select Function"
                  fluid
                  search
                  selection
                  options={ this.props.multi ? this.multiFunctions : this.scalarFunctions }
                  value={ this.props.function }
                  onChange={ this.onSelectChange }
                  disabled={ !this.props.editable }
                />
              </Col>
              <Col md={ 2 }>
                <Button
                  variant="secondary"
                  size="sm"
                  hidden={ this.props.function !== 'text_search' || !this.props.editable }
                  onClick={ this.toggleInfo }
                >
                  <i className="material-icons">info</i>
                </Button>
              </Col>
            </Row>
            <Form.Control.Feedback
              type="invalid"
              className={ classNames({ 'd-block': !!(alerts && alerts.trans_func_name) }) }
            >
              { alerts && alerts.trans_func_name }
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Alert variant="info" hidden={ !this.state.showInfo }>
          <p>The example below explains how the <b>text search</b> operation works:</p>
          <p>Consider a <b>text search</b> operation for donor country</p>
          <ul>
            <li><i className="text-danger">united kingdom</i> only returns case insensitive exact matches.</li>
            <li><i className="text-danger">%united%</i> returns substring case insensitive matches.</li>
            <li><i className="text-danger">united kingdom|uganda</i> for exact matches joined by OR.</li>
            <li><i className="text-danger">united kingdom&uganda</i> for exact matches joined by AND.</li>
          </ul>
        </Alert>

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
              disabled={ !this.props.editable }
            />
            <Form.Control.Feedback type="invalid" className={ classNames({ 'd-block': columnAlert }) }>
              { columnAlert }
            </Form.Control.Feedback>
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
              disabled={ !this.props.editable }
            />
            <Form.Control.Feedback
              type="invalid"
              className={ classNames({ 'd-block': !!(alerts && alerts.operational_value) }) }
            >
              { alerts && alerts.operational_value }
            </Form.Control.Feedback>
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
        text: formatString(column.get('name') as string),
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

  private toggleInfo = () => {
    this.setState({ showInfo: !this.state.showInfo });
  }
}

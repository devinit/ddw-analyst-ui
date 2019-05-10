import classNames from 'classnames';
import * as React from 'react';
import { Col, Form } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { AggregateOptions } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { formatString } from '../../utils';

type Alerts = { [P in keyof AggregateOptions ]: string };
interface AggregateQueryBuilderProps {
  alerts?: Partial<Alerts>;
  source: SourceMap;
  groupBy?: string[];
  function?: string;
  column?: string;
  editable?: boolean;
  onUpdate?: (options: string) => void;
}

export class AggregateQueryBuilder extends React.Component<AggregateQueryBuilderProps> {
  static defaultProps: Partial<AggregateQueryBuilderProps> = { editable: true };
  private functions = [
    { key: 'Avg', text: 'Average', value: 'Avg' },
    { key: 'Sum', text: 'Sum', value: 'Sum' },
    { key: 'Max', text: 'Maximum', value: 'Max' },
    { key: 'Min', text: 'Minimum', value: 'Min' },
    { key: 'StdDev', text: 'Standard Deviation', value: 'StdDev' }
    // { key: 'DistinctOptionFunction', text: 'Distinct', value: 'DistinctOptionFunction' }
  ];

  render() {
    const columns = this.props.source.get('columns') as ColumnList;
    const { alerts } = this.props;

    return (
      <React.Fragment>

        <Col md={ 6 } className="mt-2 pl-0">
          <Form.Group>
            <Form.Label className="bmd-label-floating">Aggregate Function</Form.Label>
            <Dropdown
              name="agg_func_name"
              placeholder="Select Function"
              fluid
              search
              selection
              options={ this.functions }
              value={ this.props.function }
              onChange={ this.onChange }
              disabled={ !this.props.editable }
            />
            <Form.Control.Feedback
              type="invalid"
              className={ classNames({ 'd-block': !!(alerts && alerts.agg_func_name) }) }
            >
              { alerts && alerts.agg_func_name }
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={ 7 } className="mt-2 pl-0">
          <Form.Group>
            <Form.Label className="bmd-label-floating">Of</Form.Label>
            <Dropdown
              name="operational_column"
              placeholder="Select Column"
              fluid
              search
              selection
              options={ this.getSelectOptionsFromColumns(columns, true) }
              value={ this.props.column }
              onChange={ this.onChange }
              disabled={ !this.props.editable }
            />
            <Form.Control.Feedback
              type="invalid"
              className={ classNames({ 'd-block': !!(alerts && alerts.operational_column) }) }
            >
              { alerts && alerts.operational_column }
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Form.Group>
          <Form.Label className="bmd-label-floating">Group By</Form.Label>
          <Dropdown
            name="group_by"
            placeholder="Select Columns"
            fluid
            multiple
            search
            selection
            options={ this.getSelectOptionsFromColumns(columns) }
            value={ this.props.groupBy }
            onChange={ this.onChange }
            disabled={ !this.props.editable }
          />
          <Form.Control.Feedback
            type="invalid"
            className={ classNames({ 'd-block': !!(alerts && alerts.group_by) }) }
          >
            { alerts && alerts.group_by }
          </Form.Control.Feedback>
        </Form.Group>
      </React.Fragment>
    );
  }

  private getSelectOptionsFromColumns(columns: ColumnList, numerical = false): DropdownItemProps[] {
    if (columns.count()) {
      columns = numerical ? columns.filter(column => column.get('data_type') === 'N') : columns;

      return columns.map(column => ({
        key: column.get('id'),
        text: formatString(column.get('name') as string),
        value: column.get('name')
      })).toJS();
    }

    return [];
  }

  private onChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    if (this.props.onUpdate) {
      const { name, value } = data;
      const { function: func, groupBy, column } = this.props;
      const options = { group_by: groupBy, agg_func_name: func, operational_column: column };
      this.props.onUpdate(JSON.stringify({ ...options, [name]: value }));
    }
  }
}

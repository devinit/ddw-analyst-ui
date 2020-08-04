import classNames from 'classnames';
import { List, Set } from 'immutable';
import * as React from 'react';
import { Col, Form } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { AggregateOptions, OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns, sortObjectArrayByProperty } from '../../utils';
import { QueryBuilderHandlerStatic as QueryBuilderHandler } from '../QueryBuilderHandler';

type Alerts = { [P in keyof AggregateOptions]: string };
interface AggregateQueryBuilderProps {
  alerts?: Partial<Alerts>;
  source: SourceMap;
  groupBy?: string[];
  function?: string;
  column?: string;
  editable?: boolean;
  step: OperationStepMap;
  steps: List<OperationStepMap>;
  onUpdate?: (options: string) => void;
}

interface AggregateQueryBuilderState {
  operationalColumns: DropdownItemProps[];
  groupByColumns: DropdownItemProps[];
}

export class AggregateQueryBuilder extends React.Component<
  AggregateQueryBuilderProps,
  AggregateQueryBuilderState
> {
  static defaultProps: Partial<AggregateQueryBuilderProps> = { editable: true };
  private functions = [
    { key: 'Avg', text: 'Average', value: 'Avg' },
    { key: 'Sum', text: 'Sum', value: 'Sum' },
    { key: 'Max', text: 'Maximum', value: 'Max' },
    { key: 'Min', text: 'Minimum', value: 'Min' },
    { key: 'StdDev', text: 'Standard Deviation', value: 'StdDev' },
    // { key: 'DistinctOptionFunction', text: 'Distinct', value: 'DistinctOptionFunction' }
  ];
  state = { operationalColumns: [], groupByColumns: [] };

  render() {
    const { alerts } = this.props;

    return (
      <React.Fragment>
        <Col md={6} className="mt-2 pl-0">
          <Form.Group>
            <Form.Label className="bmd-label-floating">Aggregate Function</Form.Label>
            <Dropdown
              name="agg_func_name"
              placeholder="Select Function"
              fluid
              search
              selection
              options={this.functions}
              value={this.props.function}
              onChange={this.onChange}
              disabled={!this.props.editable}
            />
            <Form.Control.Feedback
              type="invalid"
              className={classNames({ 'd-block': !!(alerts && alerts.agg_func_name) })}
            >
              {alerts && alerts.agg_func_name}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={7} className="mt-2 pl-0">
          <Form.Group>
            <Form.Label className="bmd-label-floating">Of</Form.Label>
            <Dropdown
              name="operational_column"
              placeholder="Select Column"
              fluid
              search
              selection
              options={this.state.operationalColumns.sort(sortObjectArrayByProperty('text').sort)}
              value={this.props.column}
              onChange={this.onChange}
              disabled={!this.props.editable}
            />
            <Form.Control.Feedback
              type="invalid"
              className={classNames({ 'd-block': !!(alerts && alerts.operational_column) })}
            >
              {alerts && alerts.operational_column}
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
            options={this.state.groupByColumns.sort(sortObjectArrayByProperty('text').sort)}
            value={this.props.groupBy}
            onChange={this.onChange}
            disabled={!this.props.editable}
          />
          <Form.Control.Feedback
            type="invalid"
            className={classNames({ 'd-block': !!(alerts && alerts.group_by) })}
          >
            {alerts && alerts.group_by}
          </Form.Control.Feedback>
        </Form.Group>
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.setSelectableColumns();
  }

  componentDidUpdate(prevProps: AggregateQueryBuilderProps) {
    if (prevProps.function !== this.props.function) {
      this.setSelectableColumns();
    }
  }

  private setSelectableColumns() {
    const columns = this.props.source.get('columns') as ColumnList;
    const selectableColumns = getStepSelectableColumns(
      this.props.step,
      this.props.steps,
      columns,
    ) as Set<string>;
    this.setState({
      operationalColumns: selectableColumns.count()
        ? QueryBuilderHandler.getSelectOptionsFromFilteredColumns(
            columns,
            selectableColumns,
            this.props.function,
          )
        : [],
      groupByColumns: selectableColumns.count()
        ? QueryBuilderHandler.getSelectOptionsFromColumns(selectableColumns, columns)
        : [],
    });
  }

  private onChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    if (this.props.onUpdate) {
      const { name, value } = data;
      const { function: func, groupBy, column } = this.props;
      const options = { group_by: groupBy, agg_func_name: func, operational_column: column };
      this.props.onUpdate(JSON.stringify({ ...options, [name]: value }));
    }
  };
}

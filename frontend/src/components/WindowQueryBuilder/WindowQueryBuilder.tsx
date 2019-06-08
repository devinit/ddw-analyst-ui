import classNames from 'classnames';
import { List, Set } from 'immutable';
import * as React from 'react';
import { Col, Form } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { OperationStepMap, WindowOptions } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns, sortObjectArrayByProperty } from '../../utils';
import { QueryBuilderHandlerStatic as QueryBuilderHandler } from '../QueryBuilderHandler';

type Alerts = { [P in keyof WindowOptions ]: string };
interface WindowQueryBuilderProps {
  alerts?: Partial<Alerts>;
  source: SourceMap;
  function?: string;
  columns?: string[];
  orderBy?: string[];
  over?: string[];
  term?: string;
  editable?: boolean;
  step: OperationStepMap;
  steps: List<OperationStepMap>;
  onUpdate?: (options: string) => void;
}

const functions: DropdownItemProps[] = [
  { key: 'Avg', text: 'Average', value: 'Avg' },
  { key: 'Sum', text: 'Sum', value: 'Sum' },
  { key: 'Max', text: 'Maximum', value: 'Max' },
  { key: 'Min', text: 'Minimum', value: 'Min' },
  { key: 'StdDev', text: 'Standard Deviation', value: 'StdDev' },
  { key: 'StdDevPop', text: 'Standard Deviation for a Population', value: 'StdDevPop' },
  { key: 'NTile', text: 'NTile', value: 'NTile' },
  { key: 'Median', text: 'Median', value: 'Median' },
  { key: 'Variance', text: 'Variance', value: 'Variance' },
  { key: 'Rank', text: 'Rank', value: 'Rank' },
  { key: 'DenseRank', text: 'Dense Rank', value: 'DenseRank' },
  { key: 'RowNumber', text: 'Row Number', value: 'RowNumber' },
  { key: 'FirstValue', text: 'First Value', value: 'FirstValue' },
  { key: 'LastValue', text: 'Last Value', value: 'LastValue' }
];
export const termFunctions = [
  'NTile',
  'Median',
  'Avg',
  'StdDev',
  'StdDevPop',
  'StdDevSamp',
  'Variance',
  'VarPop',
  'VarSamp',
  'Count',
  'Sum',
  'Max',
  'Min'
];
export const positionalFunction = [ 'FirstValue', 'LastValue' ];

export const isTermFunction = (windowFunction?: string): boolean => {
  if (!windowFunction) { return false; }

  return termFunctions.includes(windowFunction);
};

export const isPositionalFunction = (windowFunction?: string): boolean => {
  if (!windowFunction) { return false; }

  return positionalFunction.includes(windowFunction);
};

export const WindowQueryBuilder: React.SFC<WindowQueryBuilderProps> = props => {
    const { alerts, columns, editable, function: func, onUpdate, over, source, step, steps, term } = props;
    const [ termOptions, setTermOptions ] = React.useState<DropdownItemProps[]>([]);
    const [ allOptions, setSelectableOptions ] = React.useState<DropdownItemProps[]>([]);

    React.useEffect(() => {
      const columnList = source.get('columns') as ColumnList;
      const selectableColumns = getStepSelectableColumns(step, steps, columnList) as Set<string>;

      const filterFunc = isTermFunction(func) ? func : undefined;
      setTermOptions(
        selectableColumns.count()
          ? QueryBuilderHandler.getSelectOptionsFromFilteredColumns(columnList, selectableColumns, filterFunc)
          : []
      );
      setSelectableOptions(
        selectableColumns.count()
          ? QueryBuilderHandler.getSelectOptionsFromColumns(selectableColumns)
          : []
      );
    }, [ func ]);

    const onChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
      if (onUpdate) {
        const { name, value } = data;
        const options = { over, window_func: func, columns, term };
        onUpdate(JSON.stringify({ ...options, [name]: value }));
      }
    };

    return (
      <React.Fragment>

        <Col md={ 6 } className="mt-2 pl-0">
          <Form.Group>
            <Form.Label className="bmd-label-floating">Window Function</Form.Label>
            <Dropdown
              name="window_func"
              placeholder="Select Function"
              fluid
              search
              selection
              options={ functions }
              value={ func }
              onChange={ onChange }
              disabled={ !editable }
            />
            <Form.Control.Feedback
              type="invalid"
              className={ classNames({ 'd-block': !!(alerts && alerts.window_func) }) }
            >
              { alerts && alerts.window_func }
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col
          md={ 7 }
          className={ classNames('mt-2 pl-0', { 'd-none': !isTermFunction(func) && !isPositionalFunction(func) }) }
        >
          <Form.Group>
            <Form.Label className="bmd-label-floating">Of</Form.Label>
            <Dropdown
              name="term"
              placeholder="Select Column"
              fluid
              search
              selection
              options={ termOptions.sort(sortObjectArrayByProperty('text').sort) }
              value={ term }
              onChange={ onChange }
              disabled={ !editable }
            />
            <Form.Control.Feedback type="invalid" className={ classNames({ 'd-block': !!(alerts && alerts.columns) }) }>
              { alerts && alerts.columns }
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Form.Group className={ classNames({ 'd-none': !isTermFunction(func) }) }>
          <Form.Label className="bmd-label-floating">Partition By</Form.Label>
          <Dropdown
            name="over"
            placeholder="Select Columns"
            fluid
            multiple
            search
            selection
            options={ allOptions.sort(sortObjectArrayByProperty('text').sort) }
            value={ over }
            onChange={ onChange }
            disabled={ !editable }
          />
          <Form.Control.Feedback type="invalid" className={ classNames({ 'd-block': !!(alerts && alerts.over) }) }>
            { alerts && alerts.over }
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group>
          <Form.Label className="bmd-label-floating">Order By</Form.Label>
          <Dropdown
            name="order_by"
            placeholder="Select Columns"
            fluid
            multiple
            search
            selection
            options={ allOptions.sort(sortObjectArrayByProperty('text').sort) }
            value={ over }
            onChange={ onChange }
            disabled={ !editable }
          />
          <Form.Control.Feedback type="invalid" className={ classNames({ 'd-block': !!(alerts && alerts.over) }) }>
            { alerts && alerts.over }
          </Form.Control.Feedback>
        </Form.Group>
      </React.Fragment>
    );
};

WindowQueryBuilder.defaultProps = {
  function: '',
  orderBy: [],
  term: '',
  over: [],
  columns: []
};

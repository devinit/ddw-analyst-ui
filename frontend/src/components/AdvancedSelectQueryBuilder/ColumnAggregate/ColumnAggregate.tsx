import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../../types/operations';
import { Column, ColumnList, SourceMap } from '../../../types/sources';

interface ColumnAggregateProps {
<<<<<<< HEAD
=======
  columns?: AdvancedQueryColumn[];
  selectableColumns?: AdvancedQueryColumn[];
>>>>>>>  Add umerical check for column aggregation
  show: boolean;
  source: SourceMap;
  columns: AdvancedQueryColumn[];
  onUpdateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
}
const aggregateOptions: DropdownItemProps[] = [
  { key: 'sum', text: 'Sum', value: 'SUM' },
  { key: 'avg', text: 'Average', value: 'AVG' },
  { key: 'max', text: 'Maximum', value: 'MAX' },
  { key: 'min', text: 'Minimum', value: 'MIN' },
  { key: 'std', text: 'Standard Deviation', value: 'STD' },
];
type SelectEvent = React.SyntheticEvent<HTMLElement, Event>;

<<<<<<< HEAD
const ColumnAggregate: FunctionComponent<ColumnAggregateProps> = ({ show, ...props }) => {
  const [columns, setColumns] = useState<DropdownItemProps[]>([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedAggregate, setSelectedAggregate] = useState('');

  useEffect(() => {
    const sourceColumns: Column[] = (props.source.get('columns') as ColumnList).toJS();

    setColumns(
      props.columns
        .filter((column) => {
          const matchingColumn = sourceColumns.find((col) => col.name === column.name);

          return matchingColumn && matchingColumn.data_type === 'N';
        })
        .map((column) => ({
          key: column.id as number,
          text: column.alias as string,
          value: column.name as string,
        })),
    );
  }, [props.columns]);

  const onSelectColumn = (_event: SelectEvent, data: DropdownProps) => {
=======
const ColumnAggregate: FunctionComponent<ColumnAggregateProps> = ({ columns, show, ...props }) => {
  const selectableColumnOptions = props.selectableColumns?.map((column) => {
    return { key: column.id, text: column.alias, value: column.name };
  }) as DropdownItemProps[];
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedAggregate, setSelectedAggregate] = useState('');
  const aggregateFunctions = [
    { key: 'Avg', text: 'Average', value: 'Avg' },
    { key: 'Sum', text: 'Sum', value: 'Sum' },
    { key: 'Max', text: 'Maximum', value: 'Max' },
    { key: 'Min', text: 'Minimum', value: 'Min' },
    { key: 'StdDev', text: 'Standard Deviation', value: 'StdDev' },
  ];
  const onSelectColumn = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
>>>>>>>  Add umerical check for column aggregation
    setSelectedColumn(data.value as string);
  };
  const onSelectAggregate = (_event: SelectEvent, data: DropdownProps) => {
    setSelectedAggregate(data.value as string);
  };
  const onAdd = () => {
    if (props.onUpdateOptions) {
      props.onUpdateOptions({
        columns: props.columns.map((col) =>
          col.name === selectedColumn ? { ...col, aggregate: selectedAggregate } : col,
        ) as AdvancedQueryColumn[],
      });
    }
  };
  const onRemove = () => {
    if (props.onUpdateOptions) {
      props.onUpdateOptions({
        columns: props.columns.map((col) => {
          if (col.name === selectedColumn && col.aggregate) delete col.aggregate;

          return col;
        }) as AdvancedQueryColumn[],
      });
    }
  };

  if (show) {
    return (
      <Row className="mb-1">
        <Col lg={4} className="my-2">
          <Dropdown
            placeholder="Select Column"
            fluid
            selection
            search
<<<<<<< HEAD
            options={columns}
=======
            options={selectableColumnOptions}
>>>>>>>  Add umerical check for column aggregation
            onChange={onSelectColumn}
            value={selectedColumn}
          />
        </Col>

        <Col lg={3} className="my-2">
          <Dropdown
            placeholder="Select Aggregation"
            fluid
            selection
            search
<<<<<<< HEAD
            options={aggregateOptions}
=======
            options={aggregateFunctions}
>>>>>>>  Add umerical check for column aggregation
            onChange={onSelectAggregate}
            value={selectedAggregate}
          />
        </Col>

        <Col lg={2}>
          <Row>
            <Button variant="link" className="btn-just-icon" onClick={onAdd}>
              <i className="material-icons">add</i>
            </Button>
            <Button variant="link" className="btn-just-icon" onClick={onRemove}>
              <i className="material-icons">remove</i>
            </Button>
          </Row>
        </Col>
      </Row>
    );
  }

  return null;
};

export { ColumnAggregate };

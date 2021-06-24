import React, { FunctionComponent, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../../types/operations';

interface ColumnAggregateProps {
  columns?: AdvancedQueryColumn[];
  selectableColumns?: AdvancedQueryColumn[];
  show: boolean;
  onUpdateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
}

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
    setSelectedColumn(data.value as string);
  };
  const onSelectAggregate = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
    setSelectedAggregate(data.value as string);
  };
  const onSubmit = () => {
    if (props.onUpdateOptions) {
      props.onUpdateOptions({
        columns: columns?.map((col) => {
          if (col.name === selectedColumn) {
            return { ...col, aggregate: selectedAggregate };
          }

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
            options={selectableColumnOptions}
            onChange={onSelectColumn}
            value={selectedColumn}
          />
        </Col>

        <Col lg={4} className="my-2">
          <Dropdown
            placeholder="Select Aggregation"
            fluid
            selection
            search
            options={aggregateFunctions}
            onChange={onSelectAggregate}
            value={selectedAggregate}
          />
        </Col>

        <Col lg={1}>
          <Row>
            <Button variant="link" className="btn-just-icon" onClick={onSubmit}>
              <i className="material-icons">add</i>
            </Button>
          </Row>
        </Col>
      </Row>
    );
  }

  return null;
};

export { ColumnAggregate };

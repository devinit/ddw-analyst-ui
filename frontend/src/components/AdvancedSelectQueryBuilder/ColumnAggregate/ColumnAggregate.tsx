import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Button, Col, Row, Toast } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../../types/operations';
import { Column, ColumnList, SourceMap } from '../../../types/sources';
import { getColumnFromName } from '../../../utils';
import { AdvancedQueryContext } from '../../QuerySentenceBuilder';

interface ColumnAggregateProps {
  activeJoinIndex: number;
  show: boolean;
  source: SourceMap;
  columns: AdvancedQueryColumn[];
  usage?: 'select' | 'join';
}
const aggregateOptions: DropdownItemProps[] = [
  { key: 'sum', text: 'Sum', value: 'SUM' },
  { key: 'avg', text: 'Average', value: 'AVG' },
  { key: 'max', text: 'Maximum', value: 'MAX' },
  { key: 'min', text: 'Minimum', value: 'MIN' },
  { key: 'std', text: 'Standard Deviation', value: 'STD' },
];
type SelectEvent = React.SyntheticEvent<HTMLElement, Event>;

const ColumnAggregate: FunctionComponent<ColumnAggregateProps> = ({
  activeJoinIndex,
  show,
  ...props
}) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [columns, setColumns] = useState<DropdownItemProps[]>([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedAggregate, setSelectedAggregate] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const sourceColumns: Column[] = (
      props.source.get('columns') as ColumnList
    ).toJS() as unknown as Column[];

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
    setSelectedColumn(data.value as string);
  };
  const onSelectAggregate = (_event: SelectEvent, data: DropdownProps) => {
    setSelectedAggregate(data.value as string);
  };
  const onAdd = () => {
    if (updateOptions) {
      setShowToast(true);
      const updatedColumns = props.columns.map((col) =>
        col.name === selectedColumn ? { ...col, aggregate: selectedAggregate } : col,
      ) as AdvancedQueryColumn[];
      if (options.join && options.join.length) {
        options.join[activeJoinIndex] = {
          ...options.join[activeJoinIndex],
          columns: [...updatedColumns],
        };
      }
      updateOptions(
        (props.usage === 'select'
          ? { columns: updatedColumns }
          : { join: [...(options.join as AdvancedQueryColumn[])] }) as AdvancedQueryOptions,
      );
    }
  };
  const onRemove = () => {
    if (updateOptions) {
      const updatedColumns = props.columns.map((col) => {
        if (col.name === selectedColumn && col.aggregate) delete col.aggregate;

        return col;
      });
      if (options.join && options.join.length) {
        options.join[activeJoinIndex] = {
          ...options.join[activeJoinIndex],
          columns: [...updatedColumns],
        };
      }
      updateOptions(
        (props.usage === 'select'
          ? { columns: updatedColumns }
          : { join: [...(options.join as AdvancedQueryColumn[])] }) as AdvancedQueryOptions,
      );
    }
  };

  if (show) {
    return (
      <Row className="mb-1">
        <Col lg={5} className="my-2">
          <Dropdown
            placeholder="Select Column"
            fluid
            selection
            search
            options={columns}
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
            options={aggregateOptions}
            onChange={onSelectAggregate}
            value={selectedAggregate}
          />
        </Col>

        <Col lg={3}>
          <Row>
            <Button variant="link" className="btn-just-icon" onClick={onAdd}>
              <i className="material-icons">add</i>
            </Button>
            <Button variant="link" className="btn-just-icon" onClick={onRemove}>
              <i className="material-icons">remove</i>
            </Button>
          </Row>
        </Col>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          className="ml-3"
        >
          <Toast.Body>
            <div>
              Aggregate <strong>{selectedAggregate}</strong> added for{' '}
              <strong>{getColumnFromName(selectedColumn, props.columns)?.alias}</strong>
            </div>
            <div>Edit above to add/remove another</div>
          </Toast.Body>
        </Toast>
      </Row>
    );
  }

  return null;
};

ColumnAggregate.defaultProps = { usage: 'select' };

export { ColumnAggregate };

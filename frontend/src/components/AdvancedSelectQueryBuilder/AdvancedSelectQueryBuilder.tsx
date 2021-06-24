import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryColumn } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import { AdvancedQueryBuilderColumnOrder } from './AdvancedQueryBuilderColumnOrder/AdvancedQueryBuilderColumnOrder';
import { ColumnAggregate } from './ColumnAggregate';
import { ColumnReset } from './ColumnReset';
import { ColumnSelector } from './ColumnSelector';
import { SelectAllColumnSelector } from './SelectAllColumnSelector';

interface ComponentProps {
  source: SourceMap;
  columns?: AdvancedQueryColumn[];
  onUpdateConfig?: (config: { columns: AdvancedQueryColumn[] }) => void;
}

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({ source, columns }) => {
  const [displayColumnSelector, setDisplayColumnSelector] = useState(false);
  const [displaySelectColumnOrder, setDisplaySelectColumnOrder] = useState(false);
  const [displayAggregateColumn, setDisplayAggregateColumn] = useState(false);
  const numericalColumns = (source.get('columns') as ColumnList).filter(
    (column) => column.get('data_type') === 'N',
  );
  const numericalSelectedColumns = columns?.filter((column) =>
    numericalColumns.find((col) => col.get('name') === column.name),
  );
  // const [config, setConfig] = useState<AdvancedQueryOptions>();
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  }, []);
  const onOrderColumns = () => {
    setDisplaySelectColumnOrder(true);
    setDisplayColumnSelector(false);
  };
  const onSelectColumns = () => {
    setDisplayColumnSelector(true);
    setDisplaySelectColumnOrder(false);
  };
  const onAggregateColumn = () => {
    setDisplayAggregateColumn(true);
    setDisplayColumnSelector(false);
    setDisplaySelectColumnOrder(false);
  };

  return (
    <AdvancedQueryContext.Consumer>
      {({ options, updateOptions }) => (
        <div className="mb-3">
          <SelectAllColumnSelector
            setShowColumnSelector={setDisplayColumnSelector}
            selectAll={options.selectAll}
            onUpdateOptions={updateOptions}
          />
          <ButtonGroup className="mr-2">
            <Button
              variant="danger"
              size="sm"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={`<i>Replaces</i> <strong>ALL</strong> columns with those selected`}
              onClick={onSelectColumns}
            >
              {options.selectAll ? 'Select Columns for Ordering' : 'Select Column(s)'}
            </Button>
            <Button
              variant="danger"
              disabled={options.columns ? options.columns.length <= 1 : false}
              onClick={onOrderColumns}
            >
              Order Columns
            </Button>
            <Button
              variant="danger"
              hidden={!(numericalSelectedColumns && numericalSelectedColumns.length > 0)}
              onClick={onAggregateColumn}
            >
              Aggregate
            </Button>

            <ColumnReset
              onUpdateOptions={updateOptions}
              setDisplayColumnSelector={setDisplayColumnSelector}
              setDisplaySelectColumnOrder={setDisplaySelectColumnOrder}
              setDisplayAggregateColumn={setDisplayAggregateColumn}
            />
            <Button variant="danger" size="sm" className="d-none">
              Insert Column
            </Button>
          </ButtonGroup>
          <ColumnSelector
            show={displayColumnSelector}
            source={source}
            columns={options.columns || []}
            onUpdateSelection={updateOptions}
            selectAll={options.selectAll}
          />
          <AdvancedQueryBuilderColumnOrder
            show={displaySelectColumnOrder}
            columns={options.columns || []}
            source={source}
            onUpdateOptions={updateOptions}
          />
          <ColumnAggregate
            show={displayAggregateColumn}
            columns={options.columns || []}
            selectableColumns={numericalSelectedColumns}
            onUpdateOptions={updateOptions}
          />
        </div>
      )}
    </AdvancedQueryContext.Consumer>
  );
};

export { AdvancedSelectQueryBuilder };

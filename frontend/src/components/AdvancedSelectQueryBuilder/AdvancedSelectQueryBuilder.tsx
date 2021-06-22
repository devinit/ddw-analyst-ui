import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryColumn } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import { SelectColumnOrder } from '../SelectColumnOrder';
import { ColumnReset } from './ColumnReset';
import { ColumnSelector } from './ColumnSelector';
import { SelectAllColumnSelector } from './SelectAllColumnSelector';

interface ComponentProps {
  source: SourceMap;
  columns?: AdvancedQueryColumn[];
  onUpdateConfig?: (config: { columns: AdvancedQueryColumn[] }) => void;
}

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({
  source,
  columns,
  ...props
}) => {
  const [displayColumnSelector, setDisplayColumnSelector] = useState(false);
  const [displaySelectColumnOrder, setDisplaySelectColumnOrder] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<{ alias: string; columnName: string }[]>(
    [],
  );
  // const [config, setConfig] = useState<AdvancedQueryOptions>();
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  }, []);
  useEffect(() => {
    if (columns) {
      setSelectedColumns(
        columns.map((column) => {
          return { alias: column.alias as string, columnName: column.name as string };
        }),
      );
    }
  }, [columns]);
  const onUpdateColumns = (options: string) => {
    const orderedColumns = JSON.parse(options).columns.map((column: string) => {
      return {
        alias: (source.get('columns') as ColumnList)
          .find((sourceColumn) => sourceColumn.get('name') === column)
          ?.get('alias'),
        columnName: column,
      };
    });
    if (props.onUpdateConfig) {
      props.onUpdateConfig({
        columns: orderedColumns.map((column: { alias: string; columnName: string }) => {
          return {
            id: (source.get('columns') as ColumnList)
              .find((sourceColumn) => sourceColumn.get('name') === column.columnName)
              ?.get('id'),
            name: column.columnName,
            alias: column.alias,
          };
        }) as AdvancedQueryColumn[],
      });
    }
  };
  const onOrderColumns = () => {
    setDisplaySelectColumnOrder(true);
    setDisplayColumnSelector(false);
  };
  const onSelectColumns = () => {
    setDisplayColumnSelector(true);
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
            <ColumnReset
              onUpdateOptions={updateOptions}
              setDisplayColumnSelector={setDisplayColumnSelector}
              setDisplaySelectColumnOrder={setDisplaySelectColumnOrder}
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
          {displaySelectColumnOrder ? (
            <SelectColumnOrder
              selectedColumns={selectedColumns}
              onUpdateColumns={onUpdateColumns}
            />
          ) : null}
        </div>
      )}
    </AdvancedQueryContext.Consumer>
  );
};

export { AdvancedSelectQueryBuilder };

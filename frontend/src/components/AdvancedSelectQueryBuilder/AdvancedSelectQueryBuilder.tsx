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

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const [displayColumnSelector, setDisplayColumnSelector] = useState(false);
  const [selectAllColumns, setAllColumns] = useState(
    (source.get('columns') as ColumnList).toJS().map((column) => {
      return { alias: column.alias, columnName: column.name };
    }),
  );
  const [displayColumnOrder, setDisplayColumnOrder] = useState(false);
  // const [config, setConfig] = useState<AdvancedQueryOptions>();
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  }, []);
  const updateColumns = (options: string) => {
    setAllColumns(
      JSON.parse(options).columns.map((column: unknown) => {
        return {
          alias: (source.get('columns') as ColumnList)
            .toJS()
            .find((sourceColumn) => sourceColumn.name === column).alias,
          columnName: column,
        };
      }),
    );
  };

  return (
    <AdvancedQueryContext.Consumer>
      {({ options, updateOptions }) => (
        <div className="mb-3">
          <SelectAllColumnSelector
            setShowColumnSelector={setDisplayColumnSelector}
            selectAll={options.selectAll}
            onUpdateOptions={updateOptions}
            displayColumnOrder={setDisplayColumnOrder}
          />
          <ButtonGroup className="mr-2">
            {options.selectAll ? (
              <Button variant="danger" size="sm" onClick={() => setDisplayColumnOrder(true)}>
                Order All Columns
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                data-toggle="tooltip"
                data-placement="top"
                data-html="true"
                title={`<i>Replaces</i> <strong>ALL</strong> columns with those selected`}
                onClick={() => setDisplayColumnSelector(true)}
              >
                Select Column(s)
              </Button>
            )}
            <ColumnReset
              onUpdateOptions={updateOptions}
              setDisplayColumnSelector={setDisplayColumnSelector}
              setDisplayColumnOrder={setDisplayColumnOrder}
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
          {displayColumnOrder ? (
            <SelectColumnOrder selectedColumns={selectAllColumns} onUpdateColumns={updateColumns} />
          ) : null}
        </div>
      )}
    </AdvancedQueryContext.Consumer>
  );
};

export { AdvancedSelectQueryBuilder };

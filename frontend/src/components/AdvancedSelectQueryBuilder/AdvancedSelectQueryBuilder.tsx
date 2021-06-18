import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryColumn } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
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
  // const [config, setConfig] = useState<AdvancedQueryOptions>();
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  }, []);

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
              onClick={() => setDisplayColumnSelector(true)}
              className="mr-1"
            >
              {options.selectAll ? 'Select Columns for Ordering' : 'Select Column(s)'}
            </Button>
            <ColumnReset onUpdateOptions={updateOptions} />
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
        </div>
      )}
    </AdvancedQueryContext.Consumer>
  );
};

export { AdvancedSelectQueryBuilder };

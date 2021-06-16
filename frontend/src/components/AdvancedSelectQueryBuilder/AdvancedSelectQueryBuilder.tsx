import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import { ColumnReset } from './ColumnReset';
import { ColumnSelector } from './ColumnSelector';
import { cleanColumn } from './ColumnSelector/utils';
import { SelectAllColumnSelector } from './SelectAllColumnSelector';

interface ComponentProps {
  source: SourceMap;
  columns?: AdvancedQueryColumn[];
  onUpdateConfig?: (config: { columns: AdvancedQueryColumn[] }) => void;
  onUpdateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
  selectAll?: boolean;
}

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({ source, ...props }) => {
  const [displayColumnSelector, setDisplayColumnSelector] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  // const [config, setConfig] = useState<AdvancedQueryOptions>();
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  }, []);
  useEffect(() => {
    if (props.onUpdateOptions && props.selectAll === true) {
      setSelectAll(true);
      props.onUpdateOptions({
        columns: (source.get('columns') as ColumnList)
          .toJS()
          .map((column) => cleanColumn(column, props.columns ? props.columns : [])),
      });
    } else if (props.onUpdateOptions && props.selectAll === false) {
      setSelectAll(false);
      props.onUpdateOptions({
        columns: [],
      });
    }
  }, [props.selectAll]);

  return (
    <AdvancedQueryContext.Consumer>
      {({ options, updateOptions }) => (
        <div className="mb-3">
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
              Select Column(s)
            </Button>
            <SelectAllColumnSelector
              setShowColumnSelector={setDisplayColumnSelector}
              setSelectAll={setSelectAll}
              selectAll={selectAll}
              onUpdateOptions={updateOptions}
              source={source}
              columns={options.columns || []}
            />
            <ColumnReset onUpdateOptions={updateOptions} setSelectAll={setSelectAll} />
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

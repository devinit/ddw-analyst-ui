import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import { ColumnSelector } from './ColumnSelector';
import { cleanColumn } from './ColumnSelector/utils';

interface ComponentProps {
  source: SourceMap;
  columns?: AdvancedQueryColumn[];
  onUpdateConfig?: (config: { columns: AdvancedQueryColumn[] }) => void;
  onUpdateOptions?: (options: Partial<AdvancedQueryOptions>) => void;
  selectAll?: boolean;
}

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({ source, ...props }) => {
  const [displayColumnSelector, setDisplayColumnSelector] = useState(false);
  // const [config, setConfig] = useState<AdvancedQueryOptions>();
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  }, []);
  useEffect(() => {
    if (props.onUpdateOptions && props.selectAll === true) {
      props.onUpdateOptions({
        columns: (source.get('columns') as ColumnList)
          .toJS()
          .map((column) => cleanColumn(column, props.columns ? props.columns : [])),
      });
    } else if (props.onUpdateOptions && props.selectAll === false) {
      props.onUpdateOptions({
        columns: [],
      });
    }
  }, [props.selectAll]);

  const onSelectAll = () => {
    setDisplayColumnSelector(true);
    if (props.onUpdateOptions) {
      props.onUpdateOptions({
        columns: (source.get('columns') as ColumnList)
          .toJS()
          .map((column) => cleanColumn(column, props.columns ? props.columns : [])),
        selectAll: true,
      });
    }
  };

  return (
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
        <Button variant="danger" size="sm" className="mr-1" data-html="true" onClick={onSelectAll}>
          Select All
        </Button>
        <Button variant="danger" size="sm" className="d-none">
          Insert Column
        </Button>
      </ButtonGroup>
      <AdvancedQueryContext.Consumer>
        {({ options, updateOptions }) => (
          <ColumnSelector
            show={displayColumnSelector}
            source={source}
            columns={options.columns || []}
            onUpdateSelection={updateOptions}
            selectAll={options.selectAll}
          />
        )}
      </AdvancedQueryContext.Consumer>
    </div>
  );
};

export { AdvancedSelectQueryBuilder };

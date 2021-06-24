import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryColumn } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { ICheck, ICheckData } from '../ICheck';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import { AdvancedQueryBuilderColumnOrder } from './AdvancedQueryBuilderColumnOrder/AdvancedQueryBuilderColumnOrder';
import { ColumnSelector } from './ColumnSelector';

interface ComponentProps {
  source: SourceMap;
  onUpdateConfig?: (config: { columns: AdvancedQueryColumn[] }) => void;
}

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [activeAction, setActiveAction] = useState<'select' | 'order'>();
  const [selectAll, setSelectAll] = useState(
    typeof options.selectAll !== 'undefined' ? options.selectAll : true,
  );
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
    if (typeof options.selectAll === 'undefined') {
      updateOptions!({ selectAll: true });
    }
  }, []);
  const onToggleSelectAll = (data: ICheckData) => {
    setSelectAll(data.checked);
    updateOptions!({ selectAll: data.checked });
  };
  const onReset = () => {
    setActiveAction(undefined);
    updateOptions!({ selectAll: true, columns: [] });
  };

  return (
    <div className="mb-3">
      <ICheck
        id="selectAll"
        name="selectAll"
        label="Select All"
        onChange={onToggleSelectAll}
        variant="danger"
        checked={selectAll}
      />
      <ButtonGroup className="mr-2">
        <Button
          variant="danger"
          size="sm"
          data-toggle="tooltip"
          data-placement="top"
          data-html="true"
          title={`<i>Replaces</i> <strong>ALL</strong> columns with those selected`}
          onClick={() => setActiveAction('select')}
        >
          {options.selectAll ? 'Select Columns for Ordering' : 'Select Column(s)'}
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={options.columns ? options.columns.length <= 1 : false}
          onClick={() => setActiveAction('order')}
        >
          Order Columns
        </Button>
        <Button variant="danger" size="sm" onClick={onReset}>
          Clear/Reset
        </Button>
      </ButtonGroup>
      <ColumnSelector
        show={activeAction === 'select'}
        source={source}
        columns={options.columns || []}
        onUpdateSelection={updateOptions}
        selectAll={options.selectAll}
      />
      <AdvancedQueryBuilderColumnOrder
        show={activeAction === 'order'}
        columns={options.columns || []}
        source={source}
        onUpdateOptions={updateOptions}
      />
    </div>
  );
};

export { AdvancedSelectQueryBuilder };

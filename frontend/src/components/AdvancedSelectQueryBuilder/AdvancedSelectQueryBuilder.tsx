import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryColumn } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { ICheck, ICheckData } from '../ICheck';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import { AdvancedQueryBuilderColumnOrder } from './AdvancedQueryBuilderColumnOrder/AdvancedQueryBuilderColumnOrder';
import { ColumnAggregate } from './ColumnAggregate';
import { ColumnSelector } from './ColumnSelector';

interface ComponentProps {
  source: SourceMap;
  onUpdateConfig?: (config: { columns: AdvancedQueryColumn[] }) => void;
}

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [activeAction, setActiveAction] = useState<'select' | 'order' | 'aggregate'>();
  const [selectAll, setSelectAll] = useState(
    typeof options.selectall !== 'undefined' ? options.selectall : true,
  );
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
    if (typeof options.selectall === 'undefined') {
      updateOptions!({ selectall: true });
    }
  }, []);
  const onToggleSelectAll = (data: ICheckData) => {
    setSelectAll(data.checked);
    updateOptions!({ selectall: data.checked });
  };
  const onReset = () => {
    setActiveAction(undefined);
    updateOptions!({ selectall: true, columns: [] });
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
          {options.selectall ? 'Select Columns for Ordering' : 'Select Column(s)'}
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={options.columns && options.columns.length <= 1}
          onClick={() => setActiveAction('order')}
        >
          Order Columns
        </Button>
        <Button
          variant="danger"
          size="sm"
          hidden={selectAll || (options.columns && !options.columns.length)}
          onClick={() => setActiveAction('aggregate')}
        >
          Aggregate
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
      />
      <AdvancedQueryBuilderColumnOrder
        show={activeAction === 'order'}
        columns={options.columns || []}
        source={source}
        onUpdateOptions={updateOptions}
      />
      <ColumnAggregate
        show={activeAction === 'aggregate'}
        source={source}
        columns={options.columns || []}
        onUpdateOptions={updateOptions}
      />
    </div>
  );
};

export { AdvancedSelectQueryBuilder };

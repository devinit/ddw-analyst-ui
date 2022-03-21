import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Dropdown } from 'semantic-ui-react';
import styled from 'styled-components';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { ICheck, ICheckData } from '../ICheck';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import { AdvancedQueryBuilderColumnOrder } from './AdvancedQueryBuilderColumnOrder/AdvancedQueryBuilderColumnOrder';
import { ColumnAggregate } from './ColumnAggregate';
import { ColumnSelector } from './ColumnSelector';

interface ComponentProps {
  source: SourceMap;
  usage?: AdvancedSelectUsage;
}
type AdvancedSelectUsage = 'select' | 'join';

const getDefaultSelectAll = (usage: AdvancedSelectUsage, selectAll?: boolean): boolean => {
  if (usage === 'join') {
    return false;
  }

  return typeof selectAll !== 'undefined' ? selectAll : true;
};

const hasNumericalColumn = (
  sourceColumns: ColumnList,
  activeColumns: AdvancedQueryColumn[],
): boolean =>
  !!activeColumns.find((_column) =>
    sourceColumns.find(
      (column) => column.get('data_type') === 'N' && column.get('name') === _column.name,
    ),
  );

const showAggregateButton = (
  sourceColumns: ColumnList,
  options: AdvancedQueryOptions,
  usage: AdvancedSelectUsage = 'select',
) => {
  if (usage === 'join' && options.join?.columns && options.join.columns.length) {
    return hasNumericalColumn(sourceColumns, options.join.columns);
  }

  if (usage === 'select' && options.columns && options.columns.length) {
    return hasNumericalColumn(sourceColumns, options.columns);
  }

  return false;
};

type ActiveAction = 'select' | 'order' | 'aggregate';
interface ActionConfigs {
  [key: string]: ActionConfig;
}

interface ActionConfig {
  label: string;
  disabled?: boolean;
}

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({ source, usage }) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [activeAction, setActiveAction] = useState<ActiveAction>('select');
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const [selectAll, setSelectAll] = useState(getDefaultSelectAll(usage!, options.selectall));
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
    if (typeof options.selectall === 'undefined') {
      updateOptions!({ selectall: true });
    }
  }, []);
  useEffect(() => {
    if (typeof options.selectall !== 'undefined' && options.selectall !== selectAll) {
      setSelectAll(options.selectall);
    }
  }, [options.selectall]);
  const onToggleSelectAll = (data: ICheckData) => {
    setSelectAll(data.checked);
    updateOptions!({ selectall: data.checked });
  };
  const onReset = () => {
    setActiveAction('select');
    if (usage === 'select') {
      updateOptions!({ selectall: true, columns: [] });
    } else if (options.join && options.join.columns) {
      delete options.join.columns;
      updateOptions!({ join: options.join });
    }
  };
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  return (
    <div className="mb-3">
      {usage === 'select' ? (
        <div>
          <ICheck
            id="selectAll"
            name="selectAll"
            label="Select All"
            onChange={onToggleSelectAll}
            variant="danger"
            checked={selectAll}
          />
          <ClearButton variant="danger" size="sm" onClick={onReset}>
            Clear/Reset
          </ClearButton>
        </div>
      ) : null}
      <div>
        <label>Actions</label>
        <Dropdown
          placeholder="Select Action"
          fluid
          selection
          options={getActionOptions({
            select: { label: selectAll ? 'Select Columns for Ordering' : 'Select Column(s)' },
            order: {
              label: 'Order',
              disabled:
                usage === 'join' && options.join
                  ? !options.join.columns || options.join.columns.length <= 1
                  : !options.columns || options.columns.length <= 1,
            },
            aggregate: {
              label: 'Aggregate',
              disabled:
                selectAll ||
                !showAggregateButton(source.get('columns') as ColumnList, options, usage),
            },
          })}
          value={activeAction}
          onChange={(_event, data) => setActiveAction(data.value as ActiveAction)}
          className="col-md-6"
          data-testid="qb-select-action"
        />
      </div>
      <ColumnSelector
        usage={usage}
        show={activeAction === 'select'}
        source={source}
        columns={(usage === 'join' && options.join ? options.join.columns : options.columns) || []}
      />
      <AdvancedQueryBuilderColumnOrder
        usage={usage}
        show={activeAction === 'order'}
        columns={(usage === 'join' && options.join ? options.join.columns : options.columns) || []}
        source={source}
      />
      <ColumnAggregate
        usage={usage}
        show={activeAction === 'aggregate'}
        source={source}
        columns={(usage === 'join' && options.join ? options.join.columns : options.columns) || []}
      />
    </div>
  );
};

AdvancedSelectQueryBuilder.defaultProps = { usage: 'select' };

const getActionOptions = (
  config: ActionConfigs,
): import('semantic-ui-react').DropdownItemProps[] | undefined => {
  return ['select', 'order', 'aggregate'].map((action) => ({
    value: action,
    key: action,
    text: config[action].label || action,
    disabled: config[action].disabled,
  }));
};

const ClearButton = styled(Button)`
  position: absolute;
  right: 15px;
  top: 0;
`;

export { AdvancedSelectQueryBuilder };

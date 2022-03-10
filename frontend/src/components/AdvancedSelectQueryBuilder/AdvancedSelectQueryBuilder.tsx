import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
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
  activeJoinIndex: number;
  selectedColumns: AdvancedQueryColumn[];
  onSelectColumns?: (options: Partial<AdvancedQueryOptions>) => void;
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
  activeJoinIndex: number,
) => {
  if (
    usage === 'join' &&
    options.join &&
    options.join!.length &&
    options.join[activeJoinIndex].columns &&
    options.join[activeJoinIndex].columns!.length
  ) {
    return hasNumericalColumn(sourceColumns, options.join[activeJoinIndex].columns!);
  }

  if (usage === 'select' && options.columns && options.columns.length) {
    return hasNumericalColumn(sourceColumns, options.columns);
  }

  return false;
};

type ActiveAction = 'select' | 'order' | 'aggregate';

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({
  source,
  usage,
  activeJoinIndex,
  selectedColumns,
  onSelectColumns,
}) => {
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
    } else if (options.join && options.join[activeJoinIndex].columns) {
      options.join[activeJoinIndex].columns = [];
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
      </div>
      <ButtonGroup className="mr-2 mt-0">
        <Button
          variant={activeAction === 'select' ? 'danger' : 'dark'}
          size="sm"
          data-toggle="tooltip"
          data-placement="top"
          data-html="true"
          title={`<i>Replaces</i> <strong>ALL</strong> columns with those selected`}
          onClick={() => setActiveAction('select')}
        >
          {selectAll ? 'Select Columns for Ordering' : 'Select Column(s)'}
        </Button>
        <Button
          variant={activeAction === 'order' ? 'danger' : 'dark'}
          size="sm"
          disabled={
            usage === 'join' && options.join!.length
              ? !options.join![activeJoinIndex].columns ||
                options.join![activeJoinIndex].columns!.length <= 1
              : !options.columns || options.columns.length <= 1
          }
          onClick={() => setActiveAction('order')}
        >
          Order Columns
        </Button>
        <Button
          variant={activeAction === 'aggregate' ? 'danger' : 'dark'}
          size="sm"
          hidden={
            selectAll ||
            !showAggregateButton(
              source.get('columns') as ColumnList,
              options,
              usage,
              activeJoinIndex,
            )
          }
          onClick={() => setActiveAction('aggregate')}
        >
          Aggregate
        </Button>
      </ButtonGroup>
      <ColumnSelector
        usage={usage}
        show={activeAction === 'select'}
        source={source}
        columns={
          (usage === 'join' && selectedColumns.length > 0
            ? selectedColumns
            : usage === 'select'
            ? options.columns
            : []) || []
        }
        onSelectColumns={onSelectColumns}
      />
      <AdvancedQueryBuilderColumnOrder
        usage={usage}
        show={activeAction === 'order'}
        columns={
          (usage === 'join' && options.join!.length
            ? options.join![activeJoinIndex].columns
            : options.columns) || []
        }
        source={source}
      />
      <ColumnAggregate
        usage={usage}
        show={activeAction === 'aggregate'}
        source={source}
        columns={
          (usage === 'join' && options.join!.length
            ? options.join![activeJoinIndex].columns
            : options.columns) || []
        }
      />
    </div>
  );
};

AdvancedSelectQueryBuilder.defaultProps = { usage: 'select' };

const ClearButton = styled(Button)`
  position: absolute;
  right: 15px;
  top: 8px;
`;

export { AdvancedSelectQueryBuilder };

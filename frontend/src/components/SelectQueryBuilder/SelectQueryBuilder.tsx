import { List, Set } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns, sortObjectArrayByProperty } from '../../utils';
import { CheckboxGroup, CheckboxGroupOption } from '../CheckboxGroup';
import { QueryBuilderHandlerStatic as QueryBuilderHandler } from '../QueryBuilderHandler';
import { SelectColumnOrder } from '../SelectColumnOrder';
import { SelectColumnValidator } from '../SelectColumnValidator';

interface SelectQueryBuilderProps {
  source: SourceMap;
  columns?: string[];
  editable?: boolean;
  step: OperationStepMap;
  steps: List<OperationStepMap>;
  onUpdateColumns?: (options: string) => void;
}

const SelectQueryBuilder: FunctionComponent<SelectQueryBuilderProps> = (props) => {
  const [selectableColumns, setSelectableColumns] = useState<CheckboxGroupOption[]>([]);
  const [isOrderingColumns, setIsOrderingColumns] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<{ alias: string; columnName: string }[]>(
    [],
  );

  useEffect(() => {
    const { source, step, steps } = props;
    const columns = source.get('columns') as ColumnList;
    const selectable = getStepSelectableColumns(step, steps, columns) as Set<string>;
    setSelectableColumns(
      selectable.count()
        ? (QueryBuilderHandler.getSelectOptionsFromColumns(
            selectable,
            columns,
          ) as CheckboxGroupOption[])
        : [],
    );
    setSelectedColumns(() =>
      props.columns
        ? props.columns.map((column) => ({
            alias: QueryBuilderHandler.getColumnAlias(column, columns),
            columnName: column,
          }))
        : [],
    );
  }, [props.columns]);

  const handleColumnOrderClick = () => setIsOrderingColumns(!isOrderingColumns);
  const onUpdateColumns = (columns: string[]) => {
    if (props.onUpdateColumns) props.onUpdateColumns(JSON.stringify({ columns }));
  };

  return (
    <React.Fragment>
      <Form.Group>
        <Form.Label className="bmd-label-floating">Columns</Form.Label>
        <Form.Row>
          <Button
            variant="danger"
            size="sm"
            data-testid="qb-select-column-order-button"
            onClick={handleColumnOrderClick}
          >
            {isOrderingColumns ? 'Select Columns' : 'Order Columns'}
          </Button>
        </Form.Row>
        {isOrderingColumns ? (
          <SelectColumnOrder
            selectedColumns={selectedColumns}
            onUpdateColumns={props.onUpdateColumns}
          />
        ) : (
          <SelectColumnValidator step={props.step} steps={props.steps} columns={selectableColumns}>
            <CheckboxGroup
              options={selectableColumns.sort(sortObjectArrayByProperty('text').sort)}
              selectedOptions={props.columns}
              onUpdateOptions={onUpdateColumns}
              usage={'select'}
            />
          </SelectColumnValidator>
        )}
      </Form.Group>
    </React.Fragment>
  );
};

SelectQueryBuilder.defaultProps = { editable: true };

export { SelectQueryBuilder };

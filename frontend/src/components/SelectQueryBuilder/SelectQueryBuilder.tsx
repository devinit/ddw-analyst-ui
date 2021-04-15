import { List, Set } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { DropdownItemProps } from 'semantic-ui-react';
import { OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns, sortObjectArrayByProperty } from '../../utils';
import { CheckboxGroup } from '../CheckboxGroup';
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
  const [selectableColumns, setSelectableColumns] = useState<DropdownItemProps[]>([]);
  const [columnOrderView, setColumnOrderView] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<{ alias: string; columnName: string }[]>(
    [],
  );

  useEffect(() => {
    const { source, step, steps } = props;
    const columns = source.get('columns') as ColumnList;
    const selectable = getStepSelectableColumns(step, steps, columns) as Set<string>;
    setSelectableColumns(
      selectable.count()
        ? QueryBuilderHandler.getSelectOptionsFromColumns(selectable, columns)
        : [],
    );
    setSelectedColumns(() => {
      return props.columns
        ? props.columns.map((column) => ({
            alias: QueryBuilderHandler.getColumnAlias(column, columns),
            columnName: column,
          }))
        : [];
    });
  }, [props.columns]);

  const onSelectAll = () => {
    if (props.onUpdateColumns) {
      const columns = props.source.get('columns') as ColumnList;
      const columnNames = columns.map((column) => column.get('name')).toJS();
      props.onUpdateColumns(JSON.stringify({ columns: columnNames as string[] }));
    }
  };

  const onDeselectAll = () => {
    if (props.onUpdateColumns) {
      props.onUpdateColumns(JSON.stringify({ columns: [] }));
    }
  };

  const handleColumnOrderClick = () => {
    setColumnOrderView(!columnOrderView);
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
            {columnOrderView ? 'Select Columns' : 'Order Columns'}
          </Button>
        </Form.Row>
        {columnOrderView ? (
          <SelectColumnOrder
            selectedColumns={selectedColumns}
            onUpdateColumns={props.onUpdateColumns}
          />
        ) : (
          <>
            <Form.Row>
              <Button
                variant="danger"
                size="sm"
                onClick={onSelectAll}
                hidden={!props.editable}
                data-testid="qb-select-all-button"
              >
                <i className="material-icons mr-1">check_box</i>
                Select All
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onDeselectAll}
                hidden={!props.editable}
                data-testid="qb-select-none-button"
              >
                <i className="material-icons mr-1">check_box_outline_blank</i>
                Deselect All
              </Button>
            </Form.Row>
            <SelectColumnValidator step={props.step} steps={props.steps}>
              <CheckboxGroup
                options={selectableColumns.sort(sortObjectArrayByProperty('text').sort)}
                selectedOptions={props.columns}
                onUpdateOptions={props.onUpdateColumns}
              />
            </SelectColumnValidator>
          </>
        )}
      </Form.Group>
    </React.Fragment>
  );
};

SelectQueryBuilder.defaultProps = { editable: true };

export { SelectQueryBuilder };

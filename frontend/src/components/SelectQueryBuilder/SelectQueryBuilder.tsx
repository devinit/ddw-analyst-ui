import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { List, Set } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { DropdownItemProps } from 'semantic-ui-react';
import { OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns, sortObjectArrayByProperty } from '../../utils';
import { CheckboxGroup } from '../CheckboxGroup';
import { QueryBuilderHandlerStatic as QueryBuilderHandler } from '../QueryBuilderHandler';
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
  useEffect(() => {
    const { source, step, steps } = props;
    const columns = source.get('columns') as ColumnList;
    const selectable = getStepSelectableColumns(step, steps, columns) as Set<string>;
    setSelectableColumns(
      selectable.count()
        ? QueryBuilderHandler.getSelectOptionsFromColumns(selectable, columns)
        : [],
    );
  }, []);

  const SelectColumn = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: props.id,
    });
    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {props.id}
      </div>
    );
  };
  const SelectColumnOrder = () => {
    const [items, setItems] = useState(props.columns ? props.columns.sort() : []);
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    );

    const handleDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over.id) {
        setItems(() => {
          const oldIndex = items.indexOf(active.id);
          const newIndex = items.indexOf(over.id);

          return arrayMove(items, oldIndex, newIndex);
        });
      }
    };

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SelectColumn key={item} id={item} />
          ))}
        </SortableContext>
      </DndContext>
    );
  };

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
    // console.log(columnOrderView);
  };

  return (
    <React.Fragment>
      <Form.Group>
        <Form.Label className="bmd-label-floating">Columns</Form.Label>
        <Button size="sm" onClick={handleColumnOrderClick}>
          {columnOrderView ? 'Select Columns' : 'Order Columns'}
        </Button>
        {columnOrderView ? (
          <SelectColumnOrder />
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

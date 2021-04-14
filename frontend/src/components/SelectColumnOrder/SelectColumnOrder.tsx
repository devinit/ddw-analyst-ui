import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SelectColumn } from '../SelectColumn/SelectColumn';

interface SelectColumnOrderProps {
  selectedColumns?: string[];
  onUpdateColumns?: (options: string) => void;
}
export const SelectColumnOrder: FunctionComponent<SelectColumnOrderProps> = (props) => {
  const [orderedColumns, setOrderedColumns] = useState(props.selectedColumns);

  useEffect(() => {
    if (props.onUpdateColumns) {
      props.onUpdateColumns(JSON.stringify({ columns: orderedColumns }));
    }
  }, [orderedColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over) {
      if (active.id !== over.id) {
        setOrderedColumns(() => {
          if (props.selectedColumns) {
            const oldIndex = props.selectedColumns.indexOf(active.id);
            const newIndex = props.selectedColumns.indexOf(over.id);

            return arrayMove(props.selectedColumns, oldIndex, newIndex);
          }
        });
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={props.selectedColumns ? props.selectedColumns : []}
        strategy={verticalListSortingStrategy}
      >
        {props.selectedColumns ? (
          props.selectedColumns.map((column) => <SelectColumn key={column} id={column} />)
        ) : (
          <div>No columns to sort</div>
        )}
      </SortableContext>
    </DndContext>
  );
};

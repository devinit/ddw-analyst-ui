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
  selectedColumns: { alias: string; columnName: string }[];
  onUpdateColumns?: (options: string) => void;
}

const SelectColumnOrder: FunctionComponent<SelectColumnOrderProps> = ({
  selectedColumns,
  onUpdateColumns,
}) => {
  const [orderedColumns, setOrderedColumns] = useState(
    selectedColumns?.map((column) => column.columnName),
  );

  useEffect(() => {
    if (onUpdateColumns) {
      onUpdateColumns(JSON.stringify({ columns: orderedColumns }));
    }
  }, [orderedColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      setOrderedColumns(() => {
        const columnNames = selectedColumns.map((column) => column.columnName);
        const activeColumn = selectedColumns.find((column) => column.alias === active.id);
        const overColumn = selectedColumns.find((column) => column.alias === over.id);
        const oldIndex = columnNames.indexOf(activeColumn ? activeColumn.columnName : '');
        const newIndex = columnNames.indexOf(overColumn ? overColumn.columnName : '');

        return arrayMove(columnNames, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={selectedColumns ? selectedColumns.map((column) => column.alias) : []}
        strategy={verticalListSortingStrategy}
      >
        {selectedColumns && selectedColumns.length > 0 ? (
          selectedColumns.map((column) => <SelectColumn key={column.alias} id={column.alias} />)
        ) : (
          <div>No columns selected</div>
        )}
      </SortableContext>
    </DndContext>
  );
};

export { SelectColumnOrder };

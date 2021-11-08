import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import styled from 'styled-components';
import DragOverlayItem from './DragOverlayItem';
import { SortableItem } from './SortableItem';

interface SelectColumnOrderProps {
  selectedColumns: SelectedColumn[];
  onUpdateColumns?: (options: string) => void;
}

export type SelectedColumn = { alias: string; columnName: string };

const StyledSpan = styled.span`
  top: -6px;
  position: relative;
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const StyledWrapper = styled.div`
  display: flex;
  flex: 1 1 0%;
  flex-wrap: wrap;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const SelectColumnOrder: FunctionComponent<SelectColumnOrderProps> = ({
  selectedColumns,
  onUpdateColumns,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    setActiveId(active.id);
  };

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

    setActiveId(null);
  };

  return (
    <>
      <Alert variant="dark" className="mt-3 p-3 w-50">
        <i className="material-icons">info</i>{' '}
        <StyledSpan className="d-inline-flex">Drag & drop columns to desired position</StyledSpan>
      </Alert>
      <StyledWrapper>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedColumns ? selectedColumns.map((column) => column.alias) : []}
          >
            {selectedColumns && selectedColumns.length > 0 ? (
              selectedColumns.map((column, index) => (
                <SortableItem key={column.alias} id={column.alias} count={index + 1} />
              ))
            ) : (
              <div data-testid="qb-select-no-column-message">No columns selected</div>
            )}
          </SortableContext>
          <DragOverlay>{activeId ? <DragOverlayItem id={activeId} /> : null}</DragOverlay>
        </DndContext>
      </StyledWrapper>
    </>
  );
};

export { SelectColumnOrder };

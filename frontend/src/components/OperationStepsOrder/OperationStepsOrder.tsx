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
import { Alert } from 'react-bootstrap';
import styled from 'styled-components';
import { Step } from '../OperationSteps';

interface SelectColumnOrderProps {
  createdSteps: Step[];
  onUpdateColumns?: (options: string) => void;
}

const StyledSpan = styled.span`
  top: -6px;
  position: relative;
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const StyledWrapper = styled.div`
  max-height: 400px;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const OperationStepsOrder: FunctionComponent<SelectColumnOrderProps> = ({
  createdSteps,
  onUpdateColumns,
}) => {
  const [orderedColumns, setOrderedColumns] = useState(createdSteps?.map((column) => column.name));

  useEffect(() => {
    if (onUpdateColumns) {
      onUpdateColumns(JSON.stringify(orderedColumns));
    }
  }, [orderedColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      setOrderedColumns(() => {
        const columnNames = createdSteps.map((step) => step.name);
        const activeColumn = createdSteps.find(
          (step) => `${step.name} - ${step.query_func}` === active.id,
        );
        const overColumn = createdSteps.find(
          (step) => `${step.name} - ${step.query_func}` === over.id,
        );
        const oldIndex = columnNames.indexOf(activeColumn ? activeColumn.name : '');
        const newIndex = columnNames.indexOf(overColumn ? overColumn.name : '');

        return arrayMove(columnNames, oldIndex, newIndex);
      });
    }
  };

  return (
    <>
      <Alert variant="dark" className="mt-3 p-3 w-50">
        <i className="material-icons">info</i>{' '}
        <StyledSpan className="d-inline-flex">Drag & drop columns to desired position</StyledSpan>
      </Alert>
      <StyledWrapper>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={
              createdSteps ? createdSteps.map((step) => `${step.name} - ${step.query_func}`) : []
            }
            strategy={verticalListSortingStrategy}
          >
            {createdSteps && createdSteps.length > 0 ? (
              createdSteps.map((step) => (
                <SelectColumn key={step.step_id} id={`${step.name} - ${step.query_func}`} />
              ))
            ) : (
              <div data-testid="qb-select-no-column-message">No columns selected</div>
            )}
          </SortableContext>
        </DndContext>
      </StyledWrapper>
    </>
  );
};

export { OperationStepsOrder };

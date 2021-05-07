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

interface StepsOrderProps {
  createdSteps: Step[];
  onUpdateSteps?: (options: string) => void;
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

const OperationStepsOrder: FunctionComponent<StepsOrderProps> = ({
  createdSteps,
  onUpdateSteps,
}) => {
  const [orderedSteps, setOrderedSteps] = useState(createdSteps?.map((step) => step.step_id));

  useEffect(() => {
    if (onUpdateSteps) {
      onUpdateSteps(JSON.stringify(orderedSteps));
    }
  }, [orderedSteps]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      setOrderedSteps(() => {
        const stepIds = createdSteps.map((step) => step.step_id as string);
        const activeStep = createdSteps.find(
          (step) => `${step.name} - ${step.query_func}` === active.id,
        );
        const overStep = createdSteps.find(
          (step) => `${step.name} - ${step.query_func}` === over.id,
        );
        const oldIndex = stepIds.indexOf(activeStep ? (activeStep.step_id as string) : '');
        const newIndex = stepIds.indexOf(overStep ? (overStep.step_id as string) : '');

        return arrayMove(stepIds, oldIndex, newIndex);
      });
    }
  };

  return (
    <>
      <Alert variant="dark" className="mt-3 p-3 w-50">
        <i className="material-icons">info</i>{' '}
        <StyledSpan className="d-inline-flex">Drag & drop steps to desired position</StyledSpan>
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
              <div data-testid="qb-select-no-column-message">No steps selected</div>
            )}
          </SortableContext>
        </DndContext>
      </StyledWrapper>
    </>
  );
};

export { OperationStepsOrder };

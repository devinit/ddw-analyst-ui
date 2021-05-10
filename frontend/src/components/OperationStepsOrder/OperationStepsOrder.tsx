import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Alert, ListGroup, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { Step } from '../OperationSteps';
import { OperationStepMap } from '../../types/operations';
import { List } from 'immutable';
import { SortableStep } from './SortableStep';
import { DragOverlayItem } from '../SelectColumnOrder/DragOverlayItem';

interface StepsOrderProps {
  steps: List<OperationStepMap>;
  activeStep?: OperationStepMap;
  createdSteps: Step[];
  disabled?: boolean;
  onDuplicateStep: (step?: OperationStepMap) => void;
  onUpdateSteps?: (options: string) => void;
  onClickStep: (step?: OperationStepMap) => void;
}

const StyledSpan = styled.span`
  top: -6px;
  position: relative;
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const OperationStepsOrder: FunctionComponent<StepsOrderProps> = ({
  createdSteps,
  onUpdateSteps,
  steps,
  activeStep,
  onClickStep,
  onDuplicateStep,
  disabled,
}) => {
  const [orderedSteps, setOrderedSteps] = useState(createdSteps?.map((step) => step.step_id));
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (onUpdateSteps) {
      onUpdateSteps(JSON.stringify(orderedSteps));
    }
  }, [orderedSteps]);

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
      setOrderedSteps(() => {
        const stepIds = steps.toArray().map((step) => step.get('step_id') as string);
        const activeStep = steps.find(
          (step) => `${step.get('name')} - ${step.get('query_func')}` === active.id,
        );
        const overStep = steps.find(
          (step) => `${step.get('name')} - ${step.get('query_func')}` === over.id,
        );
        const oldIndex = stepIds.indexOf(activeStep ? (activeStep.get('step_id') as string) : '');
        const newIndex = stepIds.indexOf(overStep ? (overStep.get('step_id') as string) : '');

        return arrayMove(stepIds, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  return (
    <>
      <Alert variant="dark" className="mt-3 p-3 w-50">
        <i className="material-icons">info</i>{' '}
        <StyledSpan className="d-inline-flex">
          Drag & drop steps to desired position with the drag icon on the left of each step.
        </StyledSpan>
      </Alert>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={
            createdSteps ? createdSteps.map((step) => `${step.name} - ${step.query_func}`) : []
          }
          strategy={verticalListSortingStrategy}
        >
          <Row>
            <ListGroup variant="flush" className="w-100">
              {createdSteps && createdSteps.length > 0 ? (
                createdSteps.map((step, index) => {
                  return (
                    <SortableStep
                      key={index}
                      id={`${step.name} - ${step.query_func}`}
                      steps={steps}
                      step={step}
                      activeStep={activeStep}
                      isActiveStep={activeStep && activeStep.get('step_id') === step.step_id}
                      onClickStep={onClickStep}
                      onDuplicateStep={onDuplicateStep}
                      disabled={disabled}
                    />
                  );
                })
              ) : (
                <div data-testid="qb-select-no-column-message">No steps selected</div>
              )}
            </ListGroup>
          </Row>
        </SortableContext>
        <DragOverlay>{activeId ? <DragOverlayItem id={activeId} /> : null}</DragOverlay>
      </DndContext>
    </>
  );
};

export { OperationStepsOrder };

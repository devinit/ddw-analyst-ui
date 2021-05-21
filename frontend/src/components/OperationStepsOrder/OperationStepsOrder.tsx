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
import { ListGroup, Row } from 'react-bootstrap';
import { OperationStepMap } from '../../types/operations';
import { List } from 'immutable';
import { SortableStep } from './SortableStep';
import { DragStepOverlayItem } from './DragStepOverlayItem';
import { Step } from '../OperationSteps';

interface StepsOrderProps {
  steps: List<OperationStepMap>;
  activeStep?: OperationStepMap;
  createdSteps: Step[];
  disabled?: boolean;
  onDuplicateStep: (step?: OperationStepMap) => void;
  onUpdateSteps?: (options: string) => void;
  onClickStep: (step?: OperationStepMap) => void;
}

const OperationStepsOrder: FunctionComponent<StepsOrderProps> = ({
  createdSteps,
  onUpdateSteps,
  steps,
  activeStep,
  onClickStep,
  onDuplicateStep,
  disabled,
}) => {
  const [orderedSteps, setOrderedSteps] = useState<string[]>();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragStep, setDragStep] = useState<OperationStepMap>(activeStep as OperationStepMap);

  useEffect(() => {
    if (onUpdateSteps && orderedSteps) {
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
    setDragStep(getDragStep(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      setOrderedSteps(() => {
        const stepIds = steps.toArray().map((step) => step.get('step_id') as string);
        const activeStep = steps.find((step) => `${step.get('step_id')}` === active.id);
        const overStep = steps.find((step) => `${step.get('step_id')}` === over.id);
        const oldIndex = stepIds.indexOf(activeStep ? (activeStep.get('step_id') as string) : '');
        const newIndex = stepIds.indexOf(overStep ? (overStep.get('step_id') as string) : '');

        return arrayMove(stepIds, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const getDragStep = (id: string) => {
    const step = steps.find((step) => `${step.get('step_id')}` === id);

    return step as OperationStepMap;
  };

  return (
    <>
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
                      id={`${step.step_id}`}
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
        <DragOverlay>
          {activeId ? (
            <DragStepOverlayItem
              id={activeId}
              onDuplicateStep={onDuplicateStep}
              step={dragStep}
            ></DragStepOverlayItem>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export { OperationStepsOrder };

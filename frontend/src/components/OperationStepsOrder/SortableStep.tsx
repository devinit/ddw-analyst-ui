import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { List } from 'immutable';
import React, { FunctionComponent } from 'react';
import { OperationStepMap } from '../../types/operations';
import { StyledListItem, StyledStepContainer } from '../OperationSteps';
import { Step } from '../OperationSteps/OperationSteps';
import OperationStepView from '../OperationStepView';

interface SortableStepProps {
  id: string;
  steps: List<OperationStepMap>;
  step: Step;
  activeStep?: OperationStepMap;
  isActiveStep?: boolean;
  onClickStep: (step?: OperationStepMap) => void;
  disabled?: boolean;
  onDuplicateStep: (step?: OperationStepMap) => void;
}

const SortableStep: FunctionComponent<SortableStepProps> = ({
  id,
  steps,
  activeStep,
  isActiveStep,
  ...props
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition?.toString(),
  };

  const onClickStep = (step: OperationStepMap) => () => {
    props.onClickStep(step);
  };

  const currentStep = steps.find((step) => step.get('step_id') === props.step.step_id);

  return (
    <StyledStepContainer
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-testid="qb-select-column-order"
    >
      <StyledListItem
        data-testid="qb-step-wrapper"
        className="py-2"
        onClick={!activeStep && onClickStep(currentStep as OperationStepMap)}
        disabled={(activeStep && !isActiveStep) || props.disabled}
        active={isActiveStep}
      >
        {currentStep && (
          <OperationStepView step={currentStep} onDuplicateStep={props.onDuplicateStep} />
        )}
      </StyledListItem>
    </StyledStepContainer>
  );
};

export { SortableStep };

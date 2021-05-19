import React, { forwardRef } from 'react';
import { Col, Row } from 'react-bootstrap';
import { OperationStepMap } from '../../types/operations';
import { StyledListItem, StyledStepContainer } from '../OperationSteps';
import OperationStepView from '../OperationStepView';

interface SortableStepProps {
  id: string;
  step: OperationStepMap;
  onDuplicateStep: (step?: OperationStepMap) => void;
}

const DragStepOverlayItem = forwardRef<HTMLInputElement, SortableStepProps>((props, ref) => (
  <StyledStepContainer ref={ref} id={props.id}>
    <StyledListItem data-testid="qb-step-wrapper" className="py-2" active={false}>
      <Row>
        <Col md={0.5}>
          <i className="pl-1 material-icons mr-1">drag_indicator</i>
        </Col>
        <Col className="w-90" md={11}>
          <OperationStepView step={props.step} onDuplicateStep={props.onDuplicateStep} />
        </Col>
      </Row>
    </StyledListItem>
  </StyledStepContainer>
));

DragStepOverlayItem.displayName = 'DragStepOverlayItem';

export { DragStepOverlayItem };

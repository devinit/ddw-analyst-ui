import React, { FunctionComponent } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Popup } from 'semantic-ui-react';
import styled from 'styled-components';
import { OperationStepMap } from '../../types/operations';

interface OperationStepProps {
  step: OperationStepMap;
  onDuplicateStep: (step?: OperationStepMap) => void;
}

const StyledPopContent = styled.div`
  font-size: 0.8rem;
`;
const StyledPopup = styled(Popup)`
  &.ui.popup {
    border: none;
  }
`;
const StyledIcon = styled.i`
  font-size: 18px;
  margin-right: 5px;
`;
const StyledButton = styled(Button)`
  padding-top: 0 !important;
  padding-right: 0 !important;
  margin-top: 0;
`;
const StyledContentWrapper = styled.div`
  position: relative;
`;
const StyledActionsWrapper = styled.div`
  position: absolute;
  display: inline-block;
  right: 0;
  margin-right: 1rem;
`;

export const OperationStepView: FunctionComponent<OperationStepProps> = ({ step, ...props }) => {
  const onDuplicate = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    props.onDuplicateStep(step);
  };
  const renderStepInfo = (step: OperationStepMap) => {
    return (
      <StyledActionsWrapper>
        {step.get('description') ? (
          <StyledPopup
            trigger={
              <StyledIcon className="material-icons mt-1" data-testid="step-info-trigger">
                info
              </StyledIcon>
            }
            content={<StyledPopContent>{step.get('description')}</StyledPopContent>}
            basic
          />
        ) : null}
        <StyledButton
          className="pl-1"
          title="Duplicate"
          variant="link"
          size="sm"
          data-testid="step-duplicate"
          onClick={onDuplicate}
        >
          <StyledIcon className="material-icons" data-testid="step-duplicate-trigger">
            content_copy
          </StyledIcon>
        </StyledButton>
      </StyledActionsWrapper>
    );
  };

  return (
    <React.Fragment>
      <div>
        <Badge variant="secondary">
          {(step.get('query_func') as string).toUpperCase().split('_').join(' ')}
        </Badge>
      </div>
      <StyledContentWrapper>
        {step.get('name')}
        {renderStepInfo(step)}
      </StyledContentWrapper>
    </React.Fragment>
  );
};

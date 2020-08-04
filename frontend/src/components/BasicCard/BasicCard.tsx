import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import { OperationStepMap } from '../../types/operations';

interface BasicCardProps {
  title?: string;
  onClose?: () => void;
  activeStep?: OperationStepMap | boolean;
}

const StyledIcon = styled.i`
  cursor: pointer;
`;

export const BasicCard: FunctionComponent<BasicCardProps> = ({
  title,
  onClose,
  activeStep,
  ...props
}) => {
  return (
    <Card className={classNames({ 'd-none': !activeStep })}>
      <Card.Header>
        <Card.Title>
          {title}
          <StyledIcon className="material-icons float-right" onClick={onClose}>
            close
          </StyledIcon>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="mb-2">{props.children}</div>
      </Card.Body>
    </Card>
  );
};

BasicCard.defaultProps = {
  activeStep: undefined,
};

import * as React from 'react';
import { Badge } from 'react-bootstrap';
import { Popup } from 'semantic-ui-react';
import { OperationStepMap } from '../../types/query-builder';
import styled from 'styled-components';

interface OperationStepProps {
  step: OperationStepMap;
}

const StyledPopContent = styled.div`font-size: 0.8rem;`;
const StyledPopup = styled(Popup)`
  &.ui.popup {
    border: none;
  }
`;

export class OperationStepView extends React.Component<OperationStepProps> {
  render() {
    const { step } = this.props;

    return (
      <React.Fragment>
        <div>
          <Badge variant="secondary">
            { (step.get('query_func') as string).toUpperCase() }
          </Badge>
        </div>
        <div>
          { step.get('name') }
          { this.renderStepInfo(step) }
        </div>
      </React.Fragment>
    );
  }

  private renderStepInfo(step: OperationStepMap) {
    if (step.get('description')) {
      return (
        <StyledPopup
          trigger={ <i className="material-icons float-right" data-testid="step-info-trigger">info</i> }
          content={ <StyledPopContent>{ step.get('description') }</StyledPopContent> }
          basic
        />
      );
    }
  }
}

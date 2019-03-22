import * as React from 'react';
import { Badge } from 'react-bootstrap';
import { OperationStepMap } from '../../types/query-builder';

interface OperationStepProps {
  step: OperationStepMap;
}

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
          <i className="material-icons float-right">info</i>
        </div>
      </React.Fragment>
    );
  }
}

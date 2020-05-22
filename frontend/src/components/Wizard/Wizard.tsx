import React, { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

const Wizard: FunctionComponent = (props) => {
  return (
    <div className="wizard-container">
      <Card className="card-wizard" data-color="red">
        {props.children}
      </Card>
    </div>
  );
};

export { Wizard };

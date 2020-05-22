import React, { FunctionComponent } from 'react';
import { Tab } from 'react-bootstrap';

const WizardBodyContent: FunctionComponent = ({ children, ...props }) => {
  return <Tab.Pane {...props}>{children}</Tab.Pane>;
};

export { WizardBodyContent };

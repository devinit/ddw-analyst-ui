import React, { FunctionComponent } from 'react';
import { Tab, TabPaneProps } from 'react-bootstrap';

const WizardBodyContent: FunctionComponent<TabPaneProps> = ({ children, ...props }) => {
  return <Tab.Pane {...props}>{children}</Tab.Pane>;
};

export { WizardBodyContent };

import React, { FunctionComponent, useState, useEffect } from 'react';
import { Tab, TabPaneProps } from 'react-bootstrap';

interface ComponentProps extends TabPaneProps {
  children?: React.ReactNode;
}
const WizardBodyContent: FunctionComponent<ComponentProps> = ({ children, ...props }) => {
  const [viewed, setViewed] = useState(props.active);
  useEffect(() => {
    if (props.active) {
      setViewed(true);
    }
  }, [props.active]);

  return (
    <Tab.Pane data-testid="wizard-tab-pane" {...props}>
      {viewed ? children : null}
    </Tab.Pane>
  );
};

export { WizardBodyContent };

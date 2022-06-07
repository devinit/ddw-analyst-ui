import * as React from 'react';

interface ComponentProps {
  render: boolean;
  children?: React.ReactNode;
}
export const ConditionalRender: React.FunctionComponent<ComponentProps> = (props) =>
  props.render ? <React.Fragment>{props.children}</React.Fragment> : null;

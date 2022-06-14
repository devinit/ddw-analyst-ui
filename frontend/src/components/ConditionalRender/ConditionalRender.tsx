import * as React from 'react';

export const ConditionalRender: React.FunctionComponent<{
  render: boolean;
  children?: React.ReactNode;
}> = (props) => (props.render ? <React.Fragment>{props.children}</React.Fragment> : null);

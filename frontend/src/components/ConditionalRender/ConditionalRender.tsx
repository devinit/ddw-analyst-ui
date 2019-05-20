import * as React from 'react';

export const ConditionalRender: React.SFC<{ render: boolean }> = props =>
  props.render ? <React.Fragment>{ props.children }</React.Fragment> : null;

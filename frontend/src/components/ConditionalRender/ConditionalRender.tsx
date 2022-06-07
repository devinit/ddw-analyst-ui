import * as React from 'react';
import { FunctionComponent } from 'react';

interface ComponentProps {
  render: boolean;
  children?: React.ReactNode;
}
export const ConditionalRender: FunctionComponent = (props: ComponentProps) =>
  props.render ? <React.Fragment>{props.children}</React.Fragment> : null;

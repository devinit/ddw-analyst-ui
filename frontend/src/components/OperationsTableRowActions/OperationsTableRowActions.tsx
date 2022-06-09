import * as React from 'react';

type Props = {
  children?: React.ReactNode;
};
export const OperationsTableRowActions: React.FC<Props> = (props) => {
  return <React.Fragment>{props.children}</React.Fragment>;
};

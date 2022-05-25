import * as React from 'react';

type Props = {
  children?: React.ReactNode;
};
export const AdminLayoutContent: React.FunctionComponent<Props> = (props) => {
  return <React.Fragment>{props.children}</React.Fragment>;
};

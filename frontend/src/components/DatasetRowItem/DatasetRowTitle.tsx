import * as React from 'react';

interface DatasetRowItemProps {
  text?: string;
  addClass?: string;
}

export const DatasetRowItem: React.FunctionComponent<DatasetRowItemProps> = (props) => {
  return (
    <div className={props.addClass}>
      {props.text} {props.children}
    </div>
  );
};

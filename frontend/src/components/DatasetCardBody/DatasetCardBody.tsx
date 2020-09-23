import classNames from 'classnames';
import * as React from 'react';

interface DatasetCardBodyProps {
  removePadding?: boolean;
}

export const DatasetCardBody: React.FunctionComponent<DatasetCardBodyProps> = (props) => {
  return (
    <div className={classNames('card-body', { 'p-0': props.removePadding })}>{props.children}</div>
  );
};

import React, { FunctionComponent, MouseEvent } from 'react';
import { OperationMap } from '../../types/operations';

interface ComponentProps {
  operation: OperationMap;
  show?: boolean;
  path?: string;
  action?: 'edit' | 'data' | 'history';
  onClick?: (operation: OperationMap) => void;
  children?: React.ReactNode;
}

const DatasetActionLink: FunctionComponent<ComponentProps> = (props) => {
  if (props.show) {
    const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (props.onClick) {
        event.preventDefault();
        props.onClick(props.operation);
      }
    };
    const action = props.action === 'edit' ? 'build' : props.action;
    const href = props.path || `/queries/${action}/${props.operation.get('id') as number}/`;

    return (
      <a className="btn btn-sm btn-dark" href={href} onClick={onClick} data-testid="dataset-action">
        {props.children}
      </a>
    );
  }

  return null;
};

DatasetActionLink.defaultProps = {
  show: true,
  action: 'edit',
};

export { DatasetActionLink };

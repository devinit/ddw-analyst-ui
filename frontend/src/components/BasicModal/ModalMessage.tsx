import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

interface ComponentProps {
  variant?: Variant;
  message: string;
}

type Variant = 'success' | 'error' | 'warning' | 'info';

const getTextClass = (variant: Variant = 'warning') => {
  if (variant === 'error') return 'text-danger';

  return `text-${variant}`;
};
const getIcon = (variant: Variant = 'warning'): string => {
  switch (variant) {
    case 'success':
      return 'check_circle';
    default:
      return variant;
  }
};

const ModalMessage: FunctionComponent<ComponentProps> = ({ variant, message }) => {
  return (
    <h4>
      <i className={classNames('material-icons align-middle  pr-2', getTextClass(variant))}>
        {getIcon(variant)}
      </i>
      <span className="align-middle">{message}</span>
    </h4>
  );
};

ModalMessage.defaultProps = {
  variant: 'warning',
};

export { ModalMessage };

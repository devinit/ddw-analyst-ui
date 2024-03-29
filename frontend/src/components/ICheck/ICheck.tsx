import React, { ChangeEvent, FunctionComponent, ReactNode } from 'react';
import 'icheck-bootstrap/icheck-bootstrap.css';
import classNames from 'classnames';

export interface ICheckData { // eslint-disable-line
  value: string;
  checked: boolean;
}

interface ICheckProps { // eslint-disable-line
  variant?: 'danger' | 'primary' | 'success' | 'info';
  id: string;
  name: string;
  label?: ReactNode;
  checked?: boolean;
  onChange?: (data: ICheckData, event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const ICheck: FunctionComponent<ICheckProps> = ({ id, name, label, checked, ...props }) => {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      props.onChange({ checked: event.target.checked, value: name }, event);
    }
  };

  return (
    <div className={classNames(`icheck-${props.variant}`, props.className)}>
      <input type="checkbox" id={id} name={name} onChange={onChange} checked={checked} />
      {label ? (
        <label htmlFor={id} title={typeof label === 'string' ? label : undefined}>
          {label}
        </label>
      ) : null}
    </div>
  );
};

ICheck.defaultProps = { variant: 'primary' };

export { ICheck };

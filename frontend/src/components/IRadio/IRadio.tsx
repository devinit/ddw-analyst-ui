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
  onChange?: (data: ICheckData) => void;
  className?: string;
  inline?: boolean;
}

const IRadio: FunctionComponent<ICheckProps> = ({ id, name, label, checked, ...props }) => {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      props.onChange({ checked: event.target.checked, value: id });
    }
  };

  return (
    <div
      className={classNames(`icheck-${props.variant}`, props.className, {
        'icheck-inline': props.inline,
      })}
    >
      <input type="radio" id={id} name={name} onChange={onChange} checked={checked} />
      {label ? <label htmlFor={id}>{label}</label> : null}
    </div>
  );
};

IRadio.defaultProps = { variant: 'primary' };

export { IRadio };

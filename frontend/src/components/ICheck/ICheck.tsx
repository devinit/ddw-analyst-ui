import React, { FunctionComponent } from 'react';
import 'icheck-bootstrap/icheck-bootstrap.css';

interface ICheckProps { // eslint-disable-line
  type: 'checkbox' | 'radio';
  variant?: 'danger' | 'primary' | 'success';
  id: string;
  name?: string;
  label?: string;
  onChange?: () => void;
}

const ICheck: FunctionComponent<ICheckProps> = (props) => {
  return (
    <div className={`icheck-${props.variant}`}>
      <input type={props.type} id={props.id} name={props.name} />
      {props.label ? <label htmlFor={props.id}>{props.label}</label> : null}
    </div>
  );
};

ICheck.defaultProps = { variant: 'primary' };

export { ICheck };

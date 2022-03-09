import React, { FC } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';

const DeleteAction: FC<ButtonProps> = (props) => (
  <Button variant="dark" size="sm" onClick={props.onClick} className="btn-just-icon" {...props}>
    <span className="material-icons">delete</span>
  </Button>
);

export default DeleteAction;

import React, { FC } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';

const DeleteAction: FC<ButtonProps> = (props) => (
  <Button variant="danger" size="sm" onClick={props.onClick} className="btn-just-icon">
    <span className="material-icons">delete</span>
  </Button>
);

export default DeleteAction;

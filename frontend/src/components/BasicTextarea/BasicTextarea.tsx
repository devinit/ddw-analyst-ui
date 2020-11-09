import React, { ChangeEvent, FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { FormControlElement } from '../../types/bootstrap';

interface BasicTextareaProps {
  rows?: number;
  onChange: (options: string) => void;
}

export const BasicTextarea: FunctionComponent<BasicTextareaProps> = ({ onChange }) => {
  const onTextareaChange = (event: ChangeEvent<FormControlElement>) => {
    onChange(event.currentTarget.value);
  };

  return (
    <Form.Group>
      <Form.Label className="bmd-label-floating">Query</Form.Label>
      <Form.Control name="description" as="textarea" onChange={onTextareaChange} />
      <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
    </Form.Group>
  );
};

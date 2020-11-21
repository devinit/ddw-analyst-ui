import React, { ChangeEvent, FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { FormControlElement } from '../../types/bootstrap';

interface BasicTextareaProps {
  label?: string;
  onChange: (options: string) => void;
  alerts?: { [key: string]: string } | undefined;
}

export const BasicTextarea: FunctionComponent<BasicTextareaProps> = ({
  alerts,
  onChange,
  label,
}) => {
  const onTextareaChange = (event: ChangeEvent<FormControlElement>) => {
    onChange(event.currentTarget.value);
  };

  return (
    <Form.Group>
      <Form.Label className="bmd-label-floating">{label}</Form.Label>
      <Form.Control name="description" as="textarea" onChange={onTextareaChange} />
      <Form.Control.Feedback type="invalid" className="d-block invalid-feedback">
        {alerts && alerts.error}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

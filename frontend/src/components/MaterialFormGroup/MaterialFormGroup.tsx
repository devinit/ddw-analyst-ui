import * as React from 'react';
import classNames from 'classnames';
import { Col, Form, FormGroup, Row } from 'react-bootstrap';

interface MaterialFormGroupProps {
  touched?: boolean;
  focused?: boolean;
  errors?: string;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent) => void;
  value?: string;
  md?: string | boolean | number;
  as?: string;
  id?: string;
  name?: string;
  required: boolean;
  label?: string;
}

export const MaterialFormGroup: React.SFC<MaterialFormGroupProps> = (props) => {
  const getFormGroupClasses = (value?: string): string => {
    return classNames('bmd-form-group', {
      'is-focused': props.focused,
      'is-filled': !!value,
    });
  };

  return (
    <Row>
      <Col md={props.md as any}>
        <FormGroup className={getFormGroupClasses(props.value)} data-testid="material-form-group">
          <Form.Label htmlFor={props.id || props.name} className="bmd-label-floating">
            {props.label}
          </Form.Label>
          <Form.Control
            as={props.as as any}
            id={props.id}
            required={props.required}
            name={props.name}
            onChange={props.onChange}
            isInvalid={!!props.errors}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
          />
          <Form.Control.Feedback type="invalid" data-testid="material-form-control-feedback">
            {props.touched && props.errors ? props.errors : null}
          </Form.Control.Feedback>
        </FormGroup>
      </Col>
    </Row>
  );
};

export { MaterialFormGroup as default };

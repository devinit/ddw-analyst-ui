import * as React from 'react';
import { Form } from 'react-bootstrap';

interface CheckBoxProps {
  onChange: () => void;
  defaultChecked?: boolean;
  label: string;
}

export const CheckBox: React.SFC<CheckBoxProps> = ({ defaultChecked, label, onChange }) => {
  return (
    <Form.Group>
      <Form.Check type="checkbox">
        <Form.Check.Label>
          <Form.Check.Input onChange={ onChange } defaultChecked={ defaultChecked }/>
          { label }
          <span className="form-check-sign">
            <span className="check"/>
          </span>
        </Form.Check.Label>
      </Form.Check>
    </Form.Group>
  );
};

export default CheckBox;

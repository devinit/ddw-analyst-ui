import * as React from 'react';
import { Form } from 'react-bootstrap';

interface CheckBoxProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  label: string;
  disabled?: boolean;
}

export const CheckBox: React.FunctionComponent<CheckBoxProps> = ({
  checked,
  disabled,
  label,
  onChange,
}) => {
  return (
    <Form.Group>
      <Form.Check type="checkbox">
        <Form.Check.Label>
          <Form.Check.Input onChange={onChange} checked={!!checked} disabled={disabled} />
          {label}
          <span className="form-check-sign">
            <span className="check" />
          </span>
        </Form.Check.Label>
      </Form.Check>
    </Form.Group>
  );
};

export default CheckBox;

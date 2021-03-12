import React, { FunctionComponent, useEffect, useState } from 'react';
import { Form, Checkbox, CheckboxProps, DropdownItemProps, Segment } from 'semantic-ui-react';

interface SelectQueryBuilderProps {
  options: DropdownItemProps[];
  selectedOptions?: string[];
  onUpdateOptions?: (options: string) => void;
}

const segment_style = {
  height: 350,
  overflowY: 'scroll',
};

const CheckboxGroup: FunctionComponent<SelectQueryBuilderProps> = (props) => {
  const [checkboxes, addCheckboxes] = useState<string[] | undefined>(
    props.selectedOptions && props.selectedOptions.length > 0 ? props.selectedOptions : [],
  );
  useEffect(() => {
    if (props.onUpdateOptions) {
      props.onUpdateOptions(JSON.stringify({ columns: checkboxes }));
    }
  }, [checkboxes]);

  const onChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: CheckboxProps) => {
    let updatedCheckboxes: string[] | undefined = [];
    if (data.checked) {
      updatedCheckboxes = checkboxes?.concat(data.value as string);
    } else {
      updatedCheckboxes = checkboxes?.filter((checkbox) => {
        return checkbox !== data.value;
      });
    }
    addCheckboxes(updatedCheckboxes);
  };

  const isChecked = (value: string) => {
    if (props.selectedOptions && props.selectedOptions.length > 0) {
      const item = props.selectedOptions.find((c: string) => c === value);

      return item ? true : false;
    } else {
      return false;
    }
  };

  return (
    <Segment style={segment_style}>
      {props.options.map(({ key, text, value }) => (
        <Form.Field key={key}>
          <Checkbox
            checked={isChecked(value as string)}
            label={text}
            value={value as string}
            onChange={onChange}
            className={'selectColumnCheckbox'}
          />
        </Form.Field>
      ))}
    </Segment>
  );
};

export { CheckboxGroup };

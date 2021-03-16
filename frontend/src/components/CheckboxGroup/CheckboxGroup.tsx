import React, { FunctionComponent, useEffect, useState } from 'react';
import { Checkbox, CheckboxProps, DropdownItemProps, Form, Segment } from 'semantic-ui-react';
import styled from 'styled-components';

interface ComponentProps {
  options: DropdownItemProps[];
  selectedOptions?: string[];
  onUpdateOptions?: (options: string) => void;
}

const StyledSegment = styled(Segment)`
  height: 350;
  overflowy: 'scroll';
`;

const CheckboxGroup: FunctionComponent<ComponentProps> = (props) => {
  const [checkboxes, addCheckboxes] = useState<string[] | undefined>(
    props.selectedOptions && props.selectedOptions.length > 0 ? props.selectedOptions : [],
  );
  useEffect(() => {
    if (props.onUpdateOptions) {
      props.onUpdateOptions(JSON.stringify({ columns: checkboxes }));
    }
  }, [checkboxes]);

  const onChange = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: CheckboxProps,
  ): void => {
    const updatedCheckboxes: string[] | undefined = data.checked
      ? checkboxes?.concat(data.value as string)
      : checkboxes?.filter((checkbox) => checkbox !== data.value);
    addCheckboxes(updatedCheckboxes);
  };

  const isChecked = (value: string): boolean => {
    return props.selectedOptions && props.selectedOptions.length > 0
      ? !!props.selectedOptions.find((c: string) => c === value)
      : false;
  };

  return (
    <StyledSegment>
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
    </StyledSegment>
  );
};

export { CheckboxGroup };

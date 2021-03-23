import React, { FunctionComponent, useEffect, useState } from 'react';
import { Checkbox, CheckboxProps, DropdownItemProps, Form, Segment } from 'semantic-ui-react';
import styled from 'styled-components';

interface ComponentProps {
  options: DropdownItemProps[];
  selectedOptions?: string[];
  onUpdateOptions?: (options: string) => void;
  validateCheckboxOptions?: (option: string, checkboxState: boolean | undefined) => void;
}

const StyledSegment = styled(Segment)`
  max-height: 350px;
  overflow-y: scroll;
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
    props.validateCheckboxOptions &&
      props.validateCheckboxOptions(data.value as string, data.checked);
  };

  const isChecked = (value: string): boolean => {
    return props.selectedOptions && props.selectedOptions.length > 0
      ? !!props.selectedOptions.find((c: string) => c === value)
      : false;
  };

  const groupIntoRows = (options: DropdownItemProps[]): DropdownItemProps[][] => {
    const rows: DropdownItemProps[][] = [];
    const maxPerRow = 3;
    for (let index = 0; index < options.length; index++) {
      const option = options[index];
      const latestRow = rows[rows.length - 1];
      if (index % maxPerRow && latestRow?.length < maxPerRow) {
        latestRow.push(option);
      } else {
        rows.push([option]);
      }
    }

    return rows;
  };

  return (
    <StyledSegment>
      {groupIntoRows(props.options).map((row, index) => (
        <div key={`${index}`} className="row">
          {row.map(({ key, text, value }) => (
            <Form.Field key={key} className="col-md-4">
              <Checkbox
                checked={isChecked(value as string)}
                label={text}
                value={value as string}
                onChange={onChange}
                className={'selectColumnCheckbox'}
              />
            </Form.Field>
          ))}
        </div>
      ))}
    </StyledSegment>
  );
};

export { CheckboxGroup };

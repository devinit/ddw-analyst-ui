import React, { FunctionComponent, useEffect, useState } from 'react';
import { Form, Segment } from 'semantic-ui-react';
import styled from 'styled-components';
import { ICheck, ICheckData } from '../ICheck';

export interface CheckboxGroupOption {
  text: string;
  value: string | number;
}
interface ComponentProps {
  options: CheckboxGroupOption[];
  selectedOptions?: string[];
  onUpdateOptions?: (options: string) => void;
  onDeselect?: (option: string) => void;
}

const StyledSegment = styled(Segment)`
  max-height: 350px;
  overflow-y: auto;
  border-bottom: 0 !important;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar-track {
    -webkit-box-shadow: none !important;
    background-color: transparent;
  }

  &::-webkit-scrollbar {
    width: 3px !important;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
  }
`;

const CheckboxGroup: FunctionComponent<ComponentProps> = (props) => {
  const [checkboxes, addCheckboxes] = useState<string[] | undefined>(
    props.selectedOptions && props.selectedOptions.length > 0 ? props.selectedOptions : [],
  );

  useEffect(() => {
    addCheckboxes(props.selectedOptions);
  }, [props.selectedOptions]);

  const onChange = (data: ICheckData): void => {
    const updatedCheckboxes: string[] | undefined = data.checked
      ? checkboxes?.concat(data.value as string)
      : checkboxes?.filter((checkbox) => checkbox !== data.value);
    if (props.onUpdateOptions) {
      props.onUpdateOptions(JSON.stringify({ columns: updatedCheckboxes }));
    }
    if (props.onDeselect && !data.checked) props.onDeselect(data.value as string);
  };

  const isChecked = (value: string): boolean => {
    return props.selectedOptions && props.selectedOptions.length > 0
      ? !!props.selectedOptions.find((c: string) => c === value)
      : false;
  };

  const groupIntoRows = (options: CheckboxGroupOption[]): CheckboxGroupOption[][] => {
    const rows: CheckboxGroupOption[][] = [];
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
          {row.map(({ text, value }, index) => (
            <Form.Field key={index} className="col-md-4">
              <ICheck
                variant="danger"
                checked={isChecked(value as string)}
                label={text}
                id={value as string}
                name={value as string}
                onChange={onChange}
                className="selectColumnCheckbox text-capitalize"
              />
            </Form.Field>
          ))}
        </div>
      ))}
    </StyledSegment>
  );
};

export { CheckboxGroup };

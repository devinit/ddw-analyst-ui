import React, { FunctionComponent, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Form, Segment } from 'semantic-ui-react';
import styled from 'styled-components';
import { ICheck, ICheckData } from '../ICheck';
import { SearchInput } from '../SearchInput';
import { groupIntoRows } from './utils';

export interface CheckboxGroupOption {
  text: string;
  value: string | number;
}
interface ComponentProps {
  options: CheckboxGroupOption[];
  selectedOptions?: string[];
  selectall?: boolean;
  onUpdateOptions?: (columns?: string[]) => void;
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
  const [checkboxOptions, setCheckboxOptions] = useState<CheckboxGroupOption[]>(props.options);
  const [checkboxes, addCheckboxes] = useState<string[] | undefined>(
    props.selectedOptions && props.selectedOptions.length > 0 ? props.selectedOptions : [],
  );
  const [selectAll, setSelectAll] = useState<boolean>(false);

  useEffect(() => {
    addCheckboxes(props.selectedOptions);
    setSelectAll(
      props.selectedOptions?.length === props.options.length && props.options.length > 0,
    );
  }, [props.selectedOptions]);

  useEffect(() => {
    setCheckboxOptions(props.options);
  }, [props.options]);

  const onChange = (data: ICheckData): void => {
    const updatedCheckboxes: string[] | undefined = data.checked
      ? checkboxes?.concat(data.value as string)
      : checkboxes?.filter((checkbox) => checkbox !== data.value);
    if (props.onUpdateOptions) {
      props.onUpdateOptions(updatedCheckboxes);
    }
    if (props.onDeselect && !data.checked) props.onDeselect(data.value as string);
  };

  const isChecked = (value: string): boolean => {
    return checkboxes && checkboxes.length > 0
      ? !!checkboxes.find((c: string) => c === value)
      : false;
  };

  const onSelectAllChange = (data: ICheckData): void => {
    setSelectAll(data.checked);
    if (data.checked) {
      const options = checkboxOptions.map((option) => option.value as string);
      addCheckboxes(options);
      props.onUpdateOptions ? props.onUpdateOptions(options) : null;
    } else {
      addCheckboxes([]);
      props.onUpdateOptions ? props.onUpdateOptions([]) : null;
    }
  };

  const onSearch = (searchText: string): void => {
    const filteredColumns = props.options.filter((column) => {
      if (column.text) {
        return column.text.toString().toLowerCase().indexOf(searchText.toLowerCase()) > -1;
      }
    });

    setCheckboxOptions(filteredColumns);
  };

  return (
    <>
      <Row>
        <Col>
          <SearchInput className="w-100" onSearch={onSearch} testid="checkboxgroup-search" />
        </Col>
        <Col>
          {props.selectall ? (
            <Form.Field className="col-md-4">
              <ICheck
                variant="danger"
                id="select-all"
                name="select-all"
                checked={selectAll}
                label={'Select All'}
                onChange={onSelectAllChange}
                className={'selectColumnCheckbox text-capitalize'}
              />
            </Form.Field>
          ) : null}
        </Col>
      </Row>
      <StyledSegment>
        {groupIntoRows(checkboxOptions).map((row, index) => (
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
    </>
  );
};

CheckboxGroup.defaultProps = { selectall: false };

export { CheckboxGroup };

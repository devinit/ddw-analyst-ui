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
  selectAll?: boolean;
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

const SelectAllCheck = styled(ICheck)`
  &[class*='icheck-'] {
    margin-top: 14px !important;
  }
`;

const CheckboxGroup: FunctionComponent<ComponentProps> = (props) => {
  const [checkboxOptions, setCheckboxOptions] = useState<CheckboxGroupOption[]>(props.options);
  const [checkboxes, addCheckboxes] = useState<string[] | undefined>(props.selectedOptions || []);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  useEffect(() => {
    addCheckboxes(props.selectedOptions);

    setSelectAll(!!props.options.length && props.selectedOptions?.length === props.options.length);
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
      <StyledSegment className="pt-1">
        <Row className="pb-3">
          <Col md={6}>
            <SearchInput className="w-100" onSearch={onSearch} testid="checkboxgroup-search" />
          </Col>
          {props.selectAll ? (
            <Col md={6}>
              <Form.Field className="col-md-4">
                <SelectAllCheck
                  variant="danger"
                  id="select-all"
                  name="select-all"
                  checked={selectAll}
                  label={'Select All'}
                  onChange={onSelectAllChange}
                  className={'selectColumnCheckbox text-capitalize'}
                />
              </Form.Field>
            </Col>
          ) : null}
        </Row>
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

CheckboxGroup.defaultProps = { selectAll: false };

export { CheckboxGroup };

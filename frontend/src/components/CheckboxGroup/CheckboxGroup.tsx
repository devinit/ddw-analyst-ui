import { List } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Checkbox, CheckboxProps, DropdownItemProps, Form, Segment } from 'semantic-ui-react';
import styled from 'styled-components';
import { Filters, OperationStepMap } from '../../types/operations';
import { BasicModal } from '../BasicModal';

interface ComponentProps {
  steps?: List<OperationStepMap>;
  options: DropdownItemProps[];
  selectedOptions?: string[];
  onUpdateOptions?: (options: string) => void;
}

const StyledSegment = styled(Segment)`
  max-height: 350px;
  overflow-y: scroll;
`;

const CheckboxGroup: FunctionComponent<ComponentProps> = (props) => {
  const [checkboxes, addCheckboxes] = useState<string[] | undefined>(
    props.selectedOptions && props.selectedOptions.length > 0 ? props.selectedOptions : [],
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');

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
    validateCheckboxOptions(data.value as string, data.checked);
  };

  const isChecked = (value: string): boolean => {
    return props.selectedOptions && props.selectedOptions.length > 0
      ? !!props.selectedOptions.find((c: string) => c === value)
      : false;
  };

  const validateCheckboxOptions = (
    checkboxValue: string,
    checkboxState: boolean | undefined,
  ): void => {
    const { steps } = props;
    steps &&
      steps.map((step) => {
        const options = step.get('query_kwargs') as string;
        const { filters }: Filters = options ? JSON.parse(options) : { filters: [] };
        filters.flat().reduce(function (result, filter) {
          if (filter && filter.field === checkboxValue && !checkboxState) {
            setShowModal(true);
            setModalMessage(
              `Notice that ${filter.field
                .split('_')
                .join(' ')} is used in a filter step, deselecting it here may break this query.`,
            );
          }

          return result;
        }, []);
      });
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

  const toggleShowModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <BasicModal show={showModal} onHide={toggleShowModal}>
        {modalMessage}
      </BasicModal>
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
    </>
  );
};

export { CheckboxGroup };

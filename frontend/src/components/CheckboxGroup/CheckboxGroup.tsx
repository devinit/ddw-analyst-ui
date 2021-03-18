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
        console.log(`Options are ${options}`);
        toggleModalState(options, checkboxState, checkboxValue);
      });
  };

  const toggleModalState = (
    options: string,
    checkboxState: boolean | undefined,
    checkboxValue: string,
  ): void => {
    const parsedOptions = parseOptions(options);
    parsedOptions?.values?.flat().reduce(function (result, query) {
      if (
        query &&
        query.field === checkboxValue &&
        !checkboxState &&
        parsedOptions.id === 'filters'
      ) {
        setShowModal(true);
        setModalMessage(
          `Notice that ${query.field
            .split('_')
            .join(' ')} is used in a filter step, deselecting it here may break this query.`,
        );
      }
      if (
        query &&
        query.operational_column === checkboxValue &&
        !checkboxState &&
        parsedOptions.id === 'operational_column'
      ) {
        setShowModal(true);
        setModalMessage(
          `Notice that ${query.operational_column
            .split('_')
            .join(' ')} is used in a aggregate step, deselecting it here may break this query.`,
        );
      }
      if (parsedOptions.id === 'join_on') {
        let joinColumn = '';
        Object.keys(query.join_on).forEach(function (key) {
          joinColumn = key;
        });
        if (joinColumn === checkboxValue && !checkboxState) {
          setShowModal(true);
          setModalMessage(
            `Notice that ${joinColumn
              .split('_')
              .join(' ')} is used in a join step, deselecting it here may break this query.`,
          );
        }
      }

      return result;
    }, []);
  };

  const parseOptions = (options: string) => {
    const parsedOptions = JSON.parse(options);
    if (parsedOptions.hasOwnProperty('filters')) {
      const { filters }: Filters = options ? parsedOptions : { filters: [] };

      return {
        id: 'filters',
        values: [filters],
      };
    }
    if (parsedOptions.hasOwnProperty('operational_column')) {
      const aggregateOptions = options
        ? JSON.parse(options)
        : { group_by: [], agg_func_name: '', operational_column: '' };

      return {
        id: 'operational_column',
        values: [aggregateOptions],
      };
    }
    if (parsedOptions.hasOwnProperty('join_on')) {
      const joinOptions = options
        ? JSON.parse(options)
        : {
            table_name: '',
            schema_name: '',
            join_on: {},
            columns_x: [],
            columns_y: [],
            join_how: '',
          };

      return {
        id: 'join_on',
        values: [joinOptions],
      };
    }
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

import { List } from 'immutable';
import React, { FunctionComponent, useState } from 'react';
import { Filters, OperationStepMap } from '../../types/operations';
import { BasicModal } from '../BasicModal';

interface ComponentProps {
  steps?: List<OperationStepMap>;
}

const CheckboxGroupValidator: FunctionComponent<ComponentProps> = (props) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');

  const validateCheckboxOptions = (
    checkboxValue: string,
    checkboxState: boolean | undefined,
  ): void => {
    const { steps } = props;
    steps &&
      steps.map((step) => {
        const options = step.get('query_kwargs') as string;
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
        query.operational_column === checkboxValue.substr(0, checkboxValue.lastIndexOf('_')) &&
        !checkboxState &&
        parsedOptions.id === 'aggregate'
      ) {
        setShowModal(true);
        setModalMessage(
          `Notice that ${query.operational_column
            .split('_')
            .join(' ')} is used in an aggregate step, deselecting it here may break this query.`,
        );
      }
      if (parsedOptions.id === 'join_on') {
        const keys = Object.keys(query.join_on);
        for (const iterator of keys) {
          if (iterator === checkboxValue && !checkboxState) {
            setShowModal(true);
            setModalMessage(
              `Notice that ${iterator
                .split('_')
                .join(' ')} is used in a join step, deselecting it here may break this query.`,
            );
            break;
          }
        }
      }
      if (
        query &&
        query.operational_column === checkboxValue &&
        !checkboxState &&
        parsedOptions.id === 'scalar'
      ) {
        setShowModal(true);
        setModalMessage(
          `Notice that ${query.operational_column
            .split('_')
            .join(
              ' ',
            )} is used in a scalar transform step, deselecting it here may break this query.`,
        );
      }
      if (query && query.operational_columns && !checkboxState && parsedOptions.id === 'multi') {
        for (const iterator of query.operational_columns) {
          if (iterator === checkboxValue && !checkboxState) {
            setShowModal(true);
            setModalMessage(
              `Notice that ${iterator
                .split('_')
                .join(
                  ' ',
                )} is used in a multi transform step, deselecting it here may break this query.`,
            );
            break;
          }
        }
      }
      if (query && query.over && !checkboxState && parsedOptions.id === 'window') {
        for (const iterator of query.columns) {
          if (iterator === checkboxValue && !checkboxState) {
            setShowModal(true);
            setModalMessage(
              `Notice that ${iterator
                .split('_')
                .join(' ')} is used in a window step, deselecting it here may break this query.`,
            );
            break;
          }
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
    if (
      parsedOptions.hasOwnProperty('operational_column') &&
      !parsedOptions.hasOwnProperty('trans_func_name')
    ) {
      const aggregateOptions = options
        ? JSON.parse(options)
        : { group_by: [], agg_func_name: '', operational_column: '' };

      return {
        id: 'aggregate',
        values: [aggregateOptions],
      };
    }
    if (
      parsedOptions.hasOwnProperty('operational_column') &&
      parsedOptions.hasOwnProperty('trans_func_name')
    ) {
      const scalarOptions = options
        ? JSON.parse(options)
        : { group_by: [], agg_func_name: '', operational_column: '' };

      return {
        id: 'scalar',
        values: [scalarOptions],
      };
    }
    if (parsedOptions.hasOwnProperty('operational_columns')) {
      const multiOptions = options
        ? JSON.parse(options)
        : {
            operational_value: '',
            trans_func_name: '',
            operational_column: '',
            operational_columns: [],
          };

      return {
        id: 'multi',
        values: [multiOptions],
      };
    }
    if (parsedOptions.hasOwnProperty('over')) {
      const windowOptions = options
        ? JSON.parse(options)
        : { window_fn: '', order_by: [], term: '', over: [], columns: [] };

      return {
        id: 'window',
        values: [windowOptions],
      };
    }
  };

  const toggleShowModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <BasicModal show={showModal} onHide={toggleShowModal}>
        {modalMessage}
      </BasicModal>
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { validateCheckboxOptions });
        }

        return child;
      })}
    </>
  );
};

export { CheckboxGroupValidator };

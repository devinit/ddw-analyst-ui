import { List } from 'immutable';
import React, { FunctionComponent, useState } from 'react';
import { OperationStepMap } from '../../types/operations';
import { BasicModal } from '../BasicModal';
import { SelectColumn, validateSelectColumnDeselect } from './utils';

interface ComponentProps {
  step: OperationStepMap;
  steps?: List<OperationStepMap>;
  columns: SelectColumn[];
}

const SelectColumnValidator: FunctionComponent<ComponentProps> = (props) => {
  const [modalMessage, setModalMessage] = useState<string>('');

  const onDeselectColumn = (checkboxValue: string): void => {
    const { steps } = props;
    if (steps) {
      steps
        .filter(
          (step) =>
            parseInt(step.get('step_id') as string) > parseInt(props.step.get('step_id') as string),
        )
        .forEach((step) => {
          const options = step.get('query_kwargs') as string;
          validateSelectColumnDeselect(options, checkboxValue, props.columns).then(
            (validationMessage) => {
              if (validationMessage) {
                setModalMessage(validationMessage);
              }
            },
          );
        });
    }
  };
  const toggleShowModal = () => setModalMessage('');

  return (
    <>
      <BasicModal show={!!modalMessage} onHide={toggleShowModal}>
        {modalMessage}
      </BasicModal>
      {React.Children.map(props.children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { onDeselect: onDeselectColumn })
          : child,
      )}
    </>
  );
};

export { SelectColumnValidator };

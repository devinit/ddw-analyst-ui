import { Operation, OperationMap } from '../../../types/operations';

type ValidationResponse = { [key in keyof Operation]: string } | undefined;

export const validateOperation = async (operation: OperationMap): Promise<ValidationResponse> => {
  // TODO: validation code goes here
  console.log('Validating:', operation.toJS());

  return undefined;
};

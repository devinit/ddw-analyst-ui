import { ValidationResponse } from '.';

export const handleAnd = (validationResponse: ValidationResponse): void => {
  console.log(validationResponse);
};

export const operations = [
  { key: '$lt', text: 'is Less Than', value: '$lt' },
  { key: '$le', text: 'is Less Than Or Equal', value: '$le' },
  { key: '$eq', text: 'is Equal', value: '$eq' },
  { key: '$neq', text: 'is Not Equal', value: '$ne' },
  { key: '$gt', text: 'is Greater Than', value: '$gt' },
  { key: '$ge', text: 'is Greater Than Or Equal', value: '$ge' },
];

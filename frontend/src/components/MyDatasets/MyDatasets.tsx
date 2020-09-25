import * as React from 'react';
import { OperationsTableCard } from '../OperationsTableCard';

interface MyDatasetsProps {
  limit: number;
  offset: number;
}

export const MyDatasets: React.FunctionComponent<MyDatasetsProps> = (props) => {
  return (
    <>
      <OperationsTableCard limit={props.limit} offset={props.offset} showMyQueries={true} />
    </>
  );
};

import React, { FunctionComponent } from 'react';
import { useOperation } from '../../hooks/operations';

type ComponentProps = {
  operationID?: number;
};

const QueryBuilderContainer: FunctionComponent<ComponentProps> = () => {
  const { loading, operation } = useOperation(10);
  console.log(loading, operation?.toJS());

  return <div>Content Goes Here</div>;
};

const QueryBuilderContainerMemo = React.memo(QueryBuilderContainer);

export { QueryBuilderContainerMemo as QueryBuilderContainer };

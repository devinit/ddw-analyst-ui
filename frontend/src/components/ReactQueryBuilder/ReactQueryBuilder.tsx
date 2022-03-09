import React, { FC } from 'react';
import QueryBuilder, { QueryBuilderProps } from 'react-querybuilder';
import {
  bootstrapControlClassnames,
  bootstrapControlElements,
} from '@react-querybuilder/bootstrap';
import 'react-querybuilder/dist/query-builder.scss';

const ReactQueryBuilder: FC<QueryBuilderProps> = (props) => {
  return (
    <QueryBuilder
      independentCombinators={false}
      controlElements={bootstrapControlElements}
      controlClassnames={bootstrapControlClassnames}
      {...props}
    />
  );
};

export { ReactQueryBuilder };

import React, { FC } from 'react';
import QueryBuilder, { QueryBuilderProps } from 'react-querybuilder';
import {
  bootstrapControlClassnames,
  bootstrapControlElements,
} from '@react-querybuilder/bootstrap';
import 'react-querybuilder/dist/query-builder.scss';
import './styles.css';
import { getClasses } from './utils/config';

const ReactQueryBuilder: FC<QueryBuilderProps> = (props) => {
  return (
    <QueryBuilder
      controlElements={bootstrapControlElements}
      controlClassnames={getClasses(bootstrapControlClassnames)}
      {...props}
    />
  );
};

export { ReactQueryBuilder };

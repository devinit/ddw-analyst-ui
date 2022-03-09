import {
  bootstrapControlClassnames,
  bootstrapControlElements,
} from '@react-querybuilder/bootstrap';
import React, { FC } from 'react';
import QueryBuilder, { QueryBuilderProps } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.scss';
import DeleteAction from './DeleteAction';
import './styles.css';
import { getClasses } from './utils/config';

const ReactQueryBuilder: FC<QueryBuilderProps> = (props) => {
  return (
    <QueryBuilder
      controlElements={{
        ...bootstrapControlElements,
        removeRuleAction: (props) => <DeleteAction onClick={props.handleOnClick} />,
        removeGroupAction: (props) => <DeleteAction onClick={props.handleOnClick} />,
      }}
      controlClassnames={getClasses(bootstrapControlClassnames)}
      {...props}
    />
  );
};

export { ReactQueryBuilder };

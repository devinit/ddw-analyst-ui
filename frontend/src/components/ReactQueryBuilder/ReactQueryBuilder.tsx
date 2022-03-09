import React, { FC } from 'react';
import QueryBuilder, { QueryBuilderProps } from 'react-querybuilder';
import {
  bootstrapControlClassnames,
  bootstrapControlElements,
} from '@react-querybuilder/bootstrap';
import 'react-querybuilder/dist/query-builder.scss';
import './styles.css';
import { getClasses } from './utils/config';
import { Button } from 'react-bootstrap';

const ReactQueryBuilder: FC<QueryBuilderProps> = (props) => {
  return (
    <QueryBuilder
      controlElements={{
        ...bootstrapControlElements,
        removeRuleAction: (props) => (
          <Button
            variant="danger"
            size="sm"
            onClick={props.handleOnClick}
            className="btn-just-icon"
          >
            <span className="material-icons">delete</span>
          </Button>
        ),
      }}
      controlClassnames={getClasses(bootstrapControlClassnames)}
      {...props}
    />
  );
};

export { ReactQueryBuilder };

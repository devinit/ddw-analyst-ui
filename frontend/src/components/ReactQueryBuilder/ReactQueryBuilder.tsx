import {
  bootstrapControlClassnames,
  bootstrapControlElements,
} from '@react-querybuilder/bootstrap';
import React, { FC } from 'react';
import { Button } from 'react-bootstrap';
import QueryBuilder, { QueryBuilderProps } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.scss';
import CustomSelector from './CustomSelector';
import DeleteAction from './DeleteAction';
import './styles.css';
import { getClasses } from './utils/config';

const ReactQueryBuilder: FC<QueryBuilderProps> = (props) => {
  return (
    <QueryBuilder
      controlElements={{
        ...bootstrapControlElements,
        combinatorSelector: (props) => <CustomSelector {...props} className="col-1" />,
        fieldSelector: (props) => (
          <CustomSelector {...props} className="col-3" dropdownProps={{ search: true }} />
        ),
        addRuleAction: (props) => (
          <Button variant="danger" size="sm" onClick={props.handleOnClick}>
            Add Rule
          </Button>
        ),
        addGroupAction: (props) => (
          <Button variant="warning" size="sm" onClick={props.handleOnClick}>
            Add Group
          </Button>
        ),
        removeRuleAction: (props) => <DeleteAction onClick={props.handleOnClick} />,
        removeGroupAction: (props) => <DeleteAction onClick={props.handleOnClick} />,
      }}
      controlClassnames={getClasses(bootstrapControlClassnames)}
      {...props}
    />
  );
};

export { ReactQueryBuilder };

import {
  bootstrapControlClassnames,
  bootstrapControlElements,
} from '@react-querybuilder/bootstrap';
import React, { FC } from 'react';
import { Button } from 'react-bootstrap';
import QueryBuilder, { NameLabelPair, QueryBuilderProps } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.scss';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import DeleteAction from './DeleteAction';
import './styles.css';
import { getClasses } from './utils/config';

const ReactQueryBuilder: FC<QueryBuilderProps> = (props) => {
  return (
    <QueryBuilder
      controlElements={{
        ...bootstrapControlElements,
        combinatorSelector: (props) => {
          const onChange = (
            _event: React.SyntheticEvent<HTMLElement, Event>,
            data: DropdownProps,
          ) => {
            props.handleOnChange(data.value);
          };

          return (
            <Dropdown
              className="col-1"
              fluid
              selection
              options={props.options.map((option) => ({
                key: (option as NameLabelPair).name,
                value: (option as NameLabelPair).name,
                text: option.label,
              }))}
              onChange={onChange}
              value={props.value}
            />
          );
        },
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

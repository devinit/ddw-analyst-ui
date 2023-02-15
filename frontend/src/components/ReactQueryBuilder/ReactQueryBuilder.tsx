import {
  bootstrapControlClassnames,
  bootstrapControlElements,
} from '@react-querybuilder/bootstrap';
import React, { FC, useState } from 'react';
import { Button, FormControl } from 'react-bootstrap';
import QueryBuilder, { QueryBuilderProps, ValueEditorProps } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.scss';
import CustomSelector from './CustomSelector';
import DeleteAction from './DeleteAction';
import './styles.css';
import { getClasses } from './utils/config';

const CustomValueEditor = (props: ValueEditorProps) => {
  const [value, setValue] = useState(props.value);

  return (
    <FormControl
      value={value}
      onChange={(event) => {
        setValue(event.currentTarget.value);
        props.handleOnChange(event.currentTarget.value);
      }}
    />
  );
};

const ReactQueryBuilder: FC<QueryBuilderProps> = (props) => {
  return (
    <QueryBuilder
      controlElements={{
        ...bootstrapControlElements,
        combinatorSelector: (props) => <CustomSelector {...props} className="col-2" />,
        fieldSelector: (props) => (
          <CustomSelector {...props} className="col-3" dropdownProps={{ search: true }} />
        ),
        operatorSelector: (props) => <CustomSelector {...props} className="col-2" />,
        addRuleAction: (props) => (
          <Button variant="danger" size="sm" onClick={props.handleOnClick}>
            Add Rule
          </Button>
        ),
        addGroupAction: (props) => (
          <Button variant="" size="sm" onClick={props.handleOnClick}>
            Add Group
          </Button>
        ),
        removeRuleAction: (props) => <DeleteAction onClick={props.handleOnClick} />,
        removeGroupAction: (props) => <DeleteAction onClick={props.handleOnClick} />,
        valueEditor: CustomValueEditor,
      }}
      controlClassnames={getClasses(bootstrapControlClassnames)}
      {...props}
    />
  );
};

export { ReactQueryBuilder };

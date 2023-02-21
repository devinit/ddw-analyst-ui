import React, { FC, useEffect, useState } from 'react';
import { FormControl } from 'react-bootstrap';
import { ValueEditorProps } from 'react-querybuilder';

const CustomValueEditor: FC<ValueEditorProps> = (props) => {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

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

export { CustomValueEditor };

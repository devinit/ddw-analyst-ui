import React, { FC } from 'react';
import { NameLabelPair, CombinatorSelectorProps } from 'react-querybuilder';
import { DropdownProps, Dropdown } from 'semantic-ui-react';

const CustomSelector: FC<React.PropsWithChildren<CombinatorSelectorProps>> = (props) => {
  const onChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    props.handleOnChange(data.value);
  };

  return (
    <Dropdown
      className={props.className}
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
};

export default CustomSelector;

import React, { FC } from 'react';
import { NameLabelPair, CombinatorSelectorProps, FieldSelectorProps } from 'react-querybuilder';
import { DropdownProps, Dropdown } from 'semantic-ui-react';

type SelectorProps = CombinatorSelectorProps | FieldSelectorProps;
type CustomSelectorProps = React.PropsWithChildren<SelectorProps> & {
  dropdownProps?: DropdownProps;
};

const CustomSelector: FC<CustomSelectorProps> = ({ dropdownProps, ...props }) => {
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
      {...dropdownProps}
    />
  );
};

export default CustomSelector;

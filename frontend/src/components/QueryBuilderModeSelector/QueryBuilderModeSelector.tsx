import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';

interface ComponentProps {
  onSelect: (mode: string) => void;
  label?: string;
  className?: string;
  mode?: Mode;
}
type SelectEvent = React.SyntheticEvent<HTMLElement, Event>;
const MODES: DropdownItemProps[] = [
  { value: 'gui', text: 'GUI Mode' },
  { value: 'sql', text: 'SQL Mode' },
];
export type Mode = 'gui' | 'sql';

const QueryBuilderModeSelector: FC<ComponentProps> = (props) => {
  const [selectedMode, setSelectedMode] = useState<Mode>(props.mode || 'gui');
  const onSelectMode = (_event: SelectEvent, data: DropdownProps) => {
    if (data.value) {
      props.onSelect(data.value as Mode);
    }
    setSelectedMode(data.value as Mode);
  };

  useEffect(() => {
    if (props.mode) setSelectedMode(props.mode);
  }, [props.mode]);

  return (
    <div className={classNames(props.className)}>
      <label>{props.label}</label>
      <Dropdown
        placeholder="Select Mode"
        fluid
        selection
        options={MODES}
        onChange={onSelectMode}
        value={selectedMode}
        data-testid="active-mode"
      />
    </div>
  );
};

QueryBuilderModeSelector.defaultProps = { label: 'Mode' };

export { QueryBuilderModeSelector };

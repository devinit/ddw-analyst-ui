import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { SelectEvent } from './DataSourceSelector';

export type SourceType = 'core' | 'frozen' | 'all';

interface ComponentProps {
  className?: string;
  onSelect: (sourceType: SourceType) => void;
  activeSourceType?: SourceType;
}

const DataSourceTypeSelector: FunctionComponent<ComponentProps> = ({ ...props }) => {
  const onSelectDataSourceType = (_event: SelectEvent, data: DropdownProps) => {
    props.onSelect(data.value as SourceType);
  };

  return (
    <div className={classNames(props.className)}>
      <label>Data Source Type</label>
      <Dropdown
        placeholder="Data Source Type"
        fluid
        selection
        search
        options={[
          { value: 'core', text: 'Core Sources' },
          { value: 'frozen', text: 'Frozen Sources' },
        ]}
        onChange={onSelectDataSourceType}
        value={props.activeSourceType ? props.activeSourceType : undefined}
        data-testid="data-source-type-selector"
      />
    </div>
  );
};

export { DataSourceTypeSelector };

import classNames from 'classnames';
import React, { FunctionComponent, useEffect } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { SelectEvent } from './DataSourceSelector';

export type SelectedDatasource = 'non-frozen' | 'frozen' | 'all';

interface ComponentProps {
  className?: string;
  onSelect: (selectedData: SelectedDatasource) => void;
  defaultSource?: SelectedDatasource;
}

const DataSourceSelectorToggle: FunctionComponent<ComponentProps> = ({ ...props }) => {
  useEffect(() => {
    if (props.defaultSource && props.defaultSource.length) {
      props.onSelect(props.defaultSource);
    }
  }, [props.defaultSource]);
  const onSelectDataSource = (_event: SelectEvent, data: DropdownProps) => {
    props.onSelect(data.value as SelectedDatasource);
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
          { value: 'non-frozen', text: 'Core Sources' },
          { value: 'frozen', text: 'Frozen Sources' },
        ]}
        onChange={onSelectDataSource}
        defaultValue={
          props.defaultSource && props.defaultSource.length ? props.defaultSource : undefined
        }
        data-testid="active-data-source"
      />
    </div>
  );
};

export { DataSourceSelectorToggle };

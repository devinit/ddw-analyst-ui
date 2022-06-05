import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { List } from 'immutable';
import { SourceMap } from '../../types/sources';
import { getSelectOptionsFromSources } from '../../utils';

interface ComponentProps {
  onSelect: (source: SourceMap) => void;
  source?: SourceMap;
  label?: string;
  className?: string;
  selectedDatasource: List<SourceMap>;
}
export type SelectEvent = React.SyntheticEvent<HTMLElement, Event>;

const DataSourceSelector: FunctionComponent<ComponentProps> = ({
  selectedDatasource,
  source,
  ...props
}) => {
  const onSelectSource = (_event: SelectEvent, data: DropdownProps) => {
    const selectedSource = selectedDatasource.find((source) => source.get('id') === data.value);
    if (selectedSource) {
      props.onSelect(selectedSource);
    }
  };

  return (
    <div className={classNames(props.className)}>
      <label>Select {props.label}</label>
      <Dropdown
        placeholder="Select Data Source"
        fluid
        selection
        search
        options={getSelectOptionsFromSources(selectedDatasource)}
        loading={!selectedDatasource.count()}
        onChange={onSelectSource}
        value={source ? (source.get('id') as string) : undefined}
        data-testid="data-source-selector"
      />
    </div>
  );
};

DataSourceSelector.defaultProps = { label: 'Data Source' };

export { DataSourceSelector };

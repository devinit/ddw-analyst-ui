import classNames from 'classnames';
import React, { FunctionComponent, useContext } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { SourcesContext } from '../../context';
import { SourceMap } from '../../types/sources';
import { getSelectOptionsFromSources } from '../../utils';

interface ComponentProps {
  onSelect: (source: SourceMap) => void;
  source?: SourceMap;
  label?: string;
  className?: string;
}
type SelectEvent = React.SyntheticEvent<HTMLElement, Event>;

const DataSourceSelector: FunctionComponent<ComponentProps> = ({ source, ...props }) => {
  const { sources } = useContext(SourcesContext);
  const onSelectSource = (_event: SelectEvent, data: DropdownProps) => {
    const selectedSource = sources.find((source) => source.get('id') === data.value);
    if (selectedSource) {
      props.onSelect(selectedSource);
    }
  };

  return (
    <div className={classNames(props.className)}>
      <label>{props.label}</label>
      <Dropdown
        placeholder="Select Data Source"
        fluid
        selection
        search
        options={getSelectOptionsFromSources(sources)}
        loading={sources.count() === 0}
        onChange={onSelectSource}
        value={source ? (source.get('id') as string) : undefined}
        data-testid="active-data-source"
      />
    </div>
  );
};

DataSourceSelector.defaultProps = { label: 'Data Source' };

export { DataSourceSelector };

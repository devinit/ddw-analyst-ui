import classNames from 'classnames';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { List } from 'immutable';
import { SourcesContext } from '../../context';
import { SourceMap } from '../../types/sources';
import { getSelectOptionsFromSources } from '../../utils';
import { DataSourceSelectorToggle } from './DataSourceSelectorToggle';

interface ComponentProps {
  onSelect: (source: SourceMap) => void;
  source?: SourceMap;
  label?: string;
  className?: string;
}
type SelectEvent = React.SyntheticEvent<HTMLElement, Event>;

const DataSourceSelector: FunctionComponent<ComponentProps> = ({ source, ...props }) => {
  const { sources } = useContext(SourcesContext);
  const [selectedDataSource, setSelectedDataSource] = useState<List<SourceMap>>(
    sources.filter((item) => item.get('schema') === 'repo'),
  );
  const [activeSource, setActiveSource] = useState<SourceMap>();
  useEffect(() => {
    const activeSourcez = sources.find((item) => item.get('id') === source?.get('id'));
    console.log(activeSourcez);
    setActiveSource(activeSourcez);
  }, []);
  const onSelectSource = (_event: SelectEvent, data: DropdownProps) => {
    const selectedSource = sources.find((source) => source.get('id') === data.value);
    if (selectedSource) {
      props.onSelect(selectedSource);
    }
  };
  const onSelect = (data: string) => {
    console.log(data);
    if (data === 'datasources') {
      setSelectedDataSource(sources.filter((item) => item.get('schema') === 'repo'));
    } else {
      setSelectedDataSource(sources.filter((item) => item.get('schema') !== 'repo'));
    }
  };

  return (
    <div className={classNames(props.className)}>
      <label>Select {props.label}</label>
      <DataSourceSelectorToggle
        onSelect={onSelect}
        defaultSource={
          activeSource && activeSource.get('schema') === 'repo' ? 'datasources' : 'frozen_datasets'
        }
      />
      <Dropdown
        placeholder="Select Data Source"
        fluid
        selection
        search
        options={getSelectOptionsFromSources(selectedDataSource)}
        loading={selectedDataSource.count() === 0}
        onChange={onSelectSource}
        value={source ? (source.get('id') as string) : undefined}
        data-testid="active-data-source"
      />
    </div>
  );
};

DataSourceSelector.defaultProps = { label: 'Data Source' };

export { DataSourceSelector };

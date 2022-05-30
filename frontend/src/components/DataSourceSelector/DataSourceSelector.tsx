import classNames from 'classnames';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { List } from 'immutable';
import { SourcesContext } from '../../context';
import { SourceMap } from '../../types/sources';
import { getSelectOptionsFromSources } from '../../utils';
import { SourceType } from './DataSourceTypeSelector';

interface ComponentProps {
  onSelect: (source: SourceMap) => void;
  source?: SourceMap;
  label?: string;
  className?: string;
  datasourceType: SourceType;
}
export type SelectEvent = React.SyntheticEvent<HTMLElement, Event>;

const DataSourceSelector: FunctionComponent<ComponentProps> = ({ source, ...props }) => {
  const { sources } = useContext(SourcesContext);
  const [selectedDataSource, setSelectedDataSource] = useState<List<SourceMap>>(List());
  useEffect(() => {
    setSelectedDataSource(
      sources.filter((item) => {
        return props.datasourceType === 'core'
          ? item.get('schema') === 'repo'
          : item.get('schema') !== 'repo';
      }),
    );
  }, [props.datasourceType]);
  const onSelectSource = (_event: SelectEvent, data: DropdownProps) => {
    const selectedSource = sources.find((source) => source.get('id') === data.value);
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
        options={getSelectOptionsFromSources(selectedDataSource)}
        loading={!selectedDataSource.count()}
        onChange={onSelectSource}
        value={source ? (source.get('id') as string) : undefined}
        data-testid="data-source-selector"
      />
    </div>
  );
};

DataSourceSelector.defaultProps = { label: 'Data Source' };

export { DataSourceSelector };

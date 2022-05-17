import React, { FunctionComponent, useEffect, useState } from 'react';
import { ICheckData, IRadio } from '../IRadio';

type SelectedDatasource = 'datasources' | 'frozen_datasets';

interface ComponentProps {
  onSelect: (selectedData: string) => void;
  defaultSource?: SelectedDatasource;
}

const DataSourceSelectorToggle: FunctionComponent<ComponentProps> = ({ ...props }) => {
  const [selectedData, setSelectedData] = useState<'datasources' | 'frozen_datasets'>(
    'datasources',
  );
  useEffect(() => {
    if (props.defaultSource && props.defaultSource.length) {
      setSelectedData(props.defaultSource);
      props.onSelect(props.defaultSource);
    }
  }, [props.defaultSource]);

  const onSelectData = (data: ICheckData) => {
    if (data.value !== 'hide') {
      setSelectedData(data.value as SelectedDatasource);
      if (props.onSelect) props.onSelect(data.value);
    } else {
      if (props.onSelect) props.onSelect('');
    }
  };

  return (
    <div>
      <IRadio
        variant="danger"
        id="datasources-radio-toggle"
        name="datasources-radio"
        label="Datasources"
        onChange={onSelectData}
        inline
        checked={selectedData === 'datasources'}
      />
      <IRadio
        variant="danger"
        id="frozen-datasets-radio-toggle"
        name="frozen-datasets-radio"
        label="Frozen Data"
        onChange={onSelectData}
        inline
        checked={selectedData === 'frozen_datasets'}
      />
    </div>
  );
};

export { DataSourceSelectorToggle };

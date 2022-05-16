import React, { FunctionComponent, useState } from 'react';
import { ICheckData, IRadio } from '../IRadio';

type SelectedDatasource = 'datasources' | 'frozen_datasets';

interface ComponentProps {
  onSelect: (selectedData: string) => void;
  defaultSource?: SelectedDatasource;
}

const DataSourceSelectorToggle: FunctionComponent<ComponentProps> = ({ ...props }) => {
  const [selectedData, setSelectedData] = useState<'datasources' | 'frozen_datasets'>(
    props.defaultSource ? props.defaultSource : 'datasources',
  );
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
        id="datasources"
        name="datasources"
        label="Datasources"
        onChange={onSelectData}
        inline
        checked={selectedData === 'datasources'}
      />
      <IRadio
        variant="danger"
        id="frozen_datasets"
        name="frozen_datasets"
        label="Frozen Data"
        onChange={onSelectData}
        inline
        checked={selectedData === 'frozen_datasets'}
      />
    </div>
  );
};

export { DataSourceSelectorToggle };

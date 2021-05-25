import React, { FunctionComponent, useEffect, useState } from 'react';
import { SourceMap } from '../../types/sources';
import { ICheckData, IRadio } from '../IRadio';
import { FilterWithAnd } from './FilterWithAnd';

interface ComponentProps {
  source: SourceMap;
}

type FilterBy = '$and' | '$or';

const AdvancedFilterQueryBuilder: FunctionComponent<ComponentProps> = () => {
  const [filterBy, setFilterBy] = useState<FilterBy>('$and');

  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  }, []);
  const onRadioChange = (data: ICheckData) => {
    setFilterBy(data.value as FilterBy);
  };

  return (
    <div className="mb-3">
      <div>
        <IRadio
          variant="danger"
          id="$and"
          name="filterBy"
          label="AND"
          onChange={onRadioChange}
          inline
          checked={filterBy === '$and'}
        />
        <IRadio
          variant="danger"
          id="$or"
          name="filterBy"
          label="OR"
          onChange={onRadioChange}
          inline
          checked={filterBy === '$or'}
        />
      </div>
      <FilterWithAnd show={filterBy === '$and'} />
    </div>
  );
};

export { AdvancedFilterQueryBuilder };

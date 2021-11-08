import React, { FunctionComponent, useState } from 'react';
import { ColumnList, SourceMap } from '../../types/sources';
import { ICheckData, IRadio } from '../IRadio';
import { FilterWithAndOr } from './FilterWithAndOr';
import { Set } from 'immutable';
import { QueryBuilderHandler } from '../QueryBuilderHandler';

interface ComponentProps {
  source: SourceMap;
}

export type FilterWith = '$and' | '$or';

const AdvancedFilterQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const [filterWith, setFilterWith] = useState<FilterWith>('$and');

  // parse source columns into format consumable by FilterItem
  const columns = source.get('columns') as ColumnList;
  const columnSet = Set(columns.map((column) => column.get('name') as string));
  const columnItems = QueryBuilderHandler.getSelectOptionsFromColumns(columnSet, columns);

  const onRadioChange = (data: ICheckData) => setFilterWith(data.value as FilterWith);

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
          checked={filterWith === '$and'}
        />
        <IRadio
          variant="danger"
          id="$or"
          name="filterBy"
          label="OR"
          onChange={onRadioChange}
          inline
          checked={filterWith === '$or'}
        />
      </div>
      <FilterWithAndOr
        show={!!filterWith}
        filterWith={filterWith}
        source={source}
        columns={columnItems}
      />
    </div>
  );
};

export { AdvancedFilterQueryBuilder };

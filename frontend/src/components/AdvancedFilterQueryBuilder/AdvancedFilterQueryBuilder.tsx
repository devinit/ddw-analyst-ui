import React, { FunctionComponent, useState } from 'react';
import { ColumnList, SourceMap } from '../../types/sources';
import { ICheckData, IRadio } from '../IRadio';
import { FilterWithAnd } from './FilterWithAnd';
import { Set } from 'immutable';
import { QueryBuilderHandler } from '../QueryBuilderHandler';

interface ComponentProps {
  source: SourceMap;
}

type FilterBy = '$and' | '$or';

const AdvancedFilterQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const [filterBy, setFilterBy] = useState<FilterBy>('$and');

  // parse source columns into format consumable by FilterItem
  const columns = source.get('columns') as ColumnList;
  const columnSet = Set(columns.map((column) => column.get('name') as string));
  const columnItems = QueryBuilderHandler.getSelectOptionsFromColumns(columnSet, columns);

  const onRadioChange = (data: ICheckData) => setFilterBy(data.value as FilterBy);

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
      <FilterWithAnd show={filterBy === '$and'} source={source} columns={columnItems} />
    </div>
  );
};

export { AdvancedFilterQueryBuilder };

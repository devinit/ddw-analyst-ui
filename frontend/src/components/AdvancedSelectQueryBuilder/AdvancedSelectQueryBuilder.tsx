import { Set } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { ColumnList, SourceMap } from '../../types/sources';
import { sortObjectArrayByProperty } from '../../utils';
import { CheckboxGroup, CheckboxGroupOption } from '../CheckboxGroup';
import { QueryBuilderHandler } from '../QueryBuilderHandler';

type CheckOption = CheckboxGroupOption;
interface ComponentProps {
  source: SourceMap;
}
const getColumnGroupOptionsFromSource = (source: SourceMap): CheckOption[] => {
  const columnsList = source.get('columns') as ColumnList;
  const columnSet = Set(columnsList.map((column) => column.get('name') as string));

  return QueryBuilderHandler.getSelectOptionsFromColumns(columnSet, columnsList) as CheckOption[];
};

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const [displayColumnSelector, setDisplayColumnSelector] = useState(false);
  const [columns, setColumns] = useState<CheckOption[]>([]);
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line

    setColumns(getColumnGroupOptionsFromSource(source));
  }, []);

  return (
    <div className="mb-3">
      <ButtonGroup className="mr-2">
        <Button
          variant="danger"
          size="sm"
          data-toggle="tooltip"
          data-placement="bottom"
          data-html="true"
          title={`<i>Replaces</i> <strong>ALL</strong> columns with those selected`}
          onClick={() => setDisplayColumnSelector(true)}
        >
          Select Column(s)
        </Button>
        <Button variant="danger" size="sm" className="d-none">
          Insert Column
        </Button>
        <Button variant="danger" size="sm" className="d-none">
          Order Columns
        </Button>
      </ButtonGroup>
      {displayColumnSelector ? (
        <CheckboxGroup
          options={columns.sort(sortObjectArrayByProperty('text').sort)}
          // selectedOptions={columns}
          // onUpdateOptions={onUpdateColumns}
        />
      ) : null}
    </div>
  );
};

export { AdvancedSelectQueryBuilder };

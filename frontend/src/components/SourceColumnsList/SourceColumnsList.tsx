import { Map } from 'immutable';
import React, { FunctionComponent, useState, useEffect } from 'react';
import { ColumnList } from '../../types/sources';
import { formatString } from '../../utils';
import { InfoList, InfoListItems } from '../InfoList';
import { PaginationRow } from '../PaginationRow';

interface ComponentProps {
  columns: ColumnList;
}

const LIMIT = 10;

const getInfoListFromColumns = (columns: ColumnList): InfoListItems => {
  return columns.map((column) =>
    Map()
      .set('caption', formatString(column.get('name') as string))
      .set('info', column.get('description') as string),
  ) as InfoListItems;
};
const getColumnsByPage = (columns: ColumnList, page: number): ColumnList => {
  const offset = page * LIMIT;

  return columns.slice(offset, offset + LIMIT);
};

const SourceColumnsList: FunctionComponent<ComponentProps> = ({ columns }) => {
  const [pageCount, setPageCount] = useState(Math.ceil(columns.count() / LIMIT));
  const [infoList, setInfoList] = useState(getInfoListFromColumns(getColumnsByPage(columns, 0)));
  useEffect(() => {
    setPageCount(columns.count() > 0 ? Math.ceil(columns.count() / LIMIT) : 0);
    setInfoList(getInfoListFromColumns(getColumnsByPage(columns, 0)));
  }, [columns]);

  const onPageChange = (page: { selected: number }): void => {
    setInfoList(getInfoListFromColumns(getColumnsByPage(columns, page.selected)));
  };

  return (
    <div>
      <InfoList list={infoList} className="source-columns-table" />
      {pageCount ? (
        <PaginationRow
          pageRangeDisplayed={2}
          limit={10}
          count={columns.count()}
          pageCount={pageCount}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
};

export { SourceColumnsList };

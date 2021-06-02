import { List } from 'immutable';
import queryString from 'query-string';
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Card, FormControl } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { fetchSources } from '../../actions/sources';
import { LinksMap } from '../../types/api';
import { SourceMap } from '../../types/sources';
import { PaginationRow } from '../PaginationRow';
import { SourcesTable } from '../SourcesTable/SourcesTable';
import { setQueryParams } from '../../utils';

interface ComponentProps {
  sources: List<SourceMap>;
  activeSource?: SourceMap;
  loading: boolean;
  limit: number;
  offset: number;
  links?: LinksMap;
  count: number;
}
type SourcesTableCardProps = ComponentProps;

export const SourcesTableCard: FunctionComponent<SourcesTableCardProps> = (props) => {
  const { search, pathname } = useLocation();
  const queryParams = queryString.parse(search);
  const history = useHistory();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState((queryParams.q as string) || '');
  const [pageNumber, setPageNumber] = useState(Number(queryParams.page as string) || 1);
  useEffect(() => {
    if (Object.entries(queryParams).length === 0) {
      history.push(`${pathname}?page=1`);
      setPageNumber(1);
    }
    setPageNumber(Number(queryParams.page as string));
  }, [queryParams]);
  useEffect(() => {
    const values = queryString.parse(search);
    const searchValue = (values.q as string) || '';
    dispatch(
      fetchSources({
        limit: 10,
        offset: (pageNumber - 1) * props.limit,
        search: searchValue,
      }),
    );
  }, [search, pageNumber]);

  const onSearchChange = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      const { value } = event.currentTarget as HTMLInputElement;
      setQueryParams(value, setPageNumber, setSearchQuery, history, pathname, search);
      setSearchQuery('');
    }
  };

  const onPageChange = (page: { selected: number }): void => {
    dispatch(
      fetchSources({
        limit: props.limit,
        offset: page.selected * props.limit,
        search: searchQuery,
      }),
    );
    setPageNumber(page.selected + 1);
    const values = queryString.parse(search);
    values.page = (page.selected + 1).toString() || null;
    history.push(`${pathname}?${queryString.stringify(values)}`);
  };

  const renderPagination = (): ReactNode => {
    return (
      <PaginationRow
        pageRangeDisplayed={2}
        limit={props.limit}
        count={props.count}
        pageCount={Math.ceil(props.count / props.limit)}
        onPageChange={onPageChange}
        currentPage={pageNumber === 1 ? 0 : pageNumber - 1}
        offset={(pageNumber - 1) * props.limit}
      />
    );
  };

  return (
    <React.Fragment>
      <Dimmer active={props.loading} inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Card>
        <Card.Header className="card-header-text card-header-danger">
          <Card.Title>
            <FormControl
              placeholder="Search ..."
              className="w-50"
              onKeyDown={onSearchChange}
              data-testid="sources-table-search"
            />
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <SourcesTable sources={props.sources} activeSource={props.activeSource} />
          {renderPagination()}
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

SourcesTableCard.defaultProps = {
  limit: 10,
  offset: 0,
};

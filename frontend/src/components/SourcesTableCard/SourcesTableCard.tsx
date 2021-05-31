import { List } from 'immutable';
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Card, FormControl } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import { LinksMap } from '../../types/api';
import { SourceMap } from '../../types/sources';
import { PaginationRow } from '../PaginationRow';
import { SourcesTable } from '../SourcesTable/SourcesTable';
import { fetchSources } from '../../actions/sources';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';

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
  const { search } = useLocation();
  const queryParams = queryString.parse(location.search);
  const history = useHistory();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState((queryParams.q as string) || '');
  const [pageNumber, setPageNumber] = useState(Number(queryParams.page as string) || 1);
  useEffect(() => {
    if (Object.entries(queryParams).length === 0) {
      history.push(`${window.location.pathname}?page=1`);
      setPageNumber(1);
    }
  }, [queryParams]);
  useEffect(() => {
    const values = queryString.parse(location.search);
    const search = (values.q as string) || '';
    dispatch(
      fetchSources({
        limit: 10,
        offset: (pageNumber - 1) * props.limit,
        search,
      }),
    );
  }, [search, pageNumber]);

  const onSearchChange = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      const { value } = event.currentTarget as HTMLInputElement;
      setSearchQuery(value || '');
      setPageNumber(1);
      const values = queryString.parse(location.search);
      values.q = value || null;
      values.page = '1';
      history.push(`${window.location.pathname}?${queryString.stringify(values)}`);
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
    const values = queryString.parse(location.search);
    values.page = (page.selected + 1).toString() || null;
    history.push(`${window.location.pathname}?${queryString.stringify(values)}`);
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

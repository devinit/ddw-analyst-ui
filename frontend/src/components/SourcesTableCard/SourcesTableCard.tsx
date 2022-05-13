import { List } from 'immutable';
import queryString from 'query-string';
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Dimmer, Loader, Dropdown, DropdownProps } from 'semantic-ui-react';
import { fetchSources } from '../../actions/sources';
import { LinksMap } from '../../types/api';
import { SourceMap } from '../../types/sources';
import { PaginationRow } from '../PaginationRow';
import { SearchInput } from '../SearchInput';
import { SourcesTable } from '../SourcesTable/SourcesTable';

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
type TableFilters = {
  search?: string;
  page?: number;
  frozen?: number;
};

export const SourcesTableCard: FunctionComponent<SourcesTableCardProps> = (props) => {
  const { search, pathname } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [frozenQuery, setFrozenQuery] = useState(0);
  useEffect(() => {
    const queryParams = queryString.parse(search);
    setSearchQuery((queryParams.search as string) || '');
    setPageNumber(Number(queryParams.page || 1));
    setFrozenQuery(Number(queryParams.frozen) || 0);
  }, [search]);
  useEffect(() => {
    dispatch(
      fetchSources({
        limit: 10,
        offset: (pageNumber - 1) * props.limit,
        search: searchQuery,
        frozen: frozenQuery,
      }),
    );
  }, [searchQuery, pageNumber, frozenQuery]);

  const updateQueryParams = (filter: TableFilters): void => {
    const queryParameters = { ...queryString.parse(search), ...filter };
    const cleanParameters: Partial<TableFilters> = {};
    if (queryParameters.search) cleanParameters.search = queryParameters.search;
    if (queryParameters.page) cleanParameters.page = queryParameters.page;
    if (queryParameters.frozen) cleanParameters.frozen = queryParameters.frozen;
    history.push(`${pathname}?${queryString.stringify(cleanParameters)}`);
  };

  const dropDownValues = [
    { key: 'non-frozen', text: 'Non-frozen Sources', value: 0 },
    { key: 'frozen', text: 'Frozen Sources', value: 1 },
    { key: 'all', text: 'All Sources', value: 2 },
  ];

  const onSearch = (searchText: string) => updateQueryParams({ search: searchText, page: 1 });

  const onPageChange = (page: { selected: number }): void => {
    dispatch(
      fetchSources({
        limit: props.limit,
        offset: page.selected * props.limit,
        search: searchQuery,
        frozen: frozenQuery,
      }),
    );
    updateQueryParams({ page: page.selected + 1 });
  };

  const onFilterByFrozenDataSource = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
    const { value } = data;
    updateQueryParams({ frozen: typeof value === 'number' ? value : undefined });
    setFrozenQuery(Number(value) || 0);
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
        <Card.Body>
          <Row>
            <Col xs="6" lg="4" md="6">
              <SearchInput
                className="w-100"
                value={searchQuery}
                onSearch={onSearch}
                testid="sources-table-search"
              />
            </Col>
            <Col xs="6" lg="4" md="6">
              <Dropdown
                clearable
                placeholder="Filter by Frozen Data Source"
                fluid
                search
                selection
                value={frozenQuery}
                options={dropDownValues}
                onChange={onFilterByFrozenDataSource}
              />
            </Col>
          </Row>
        </Card.Body>
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

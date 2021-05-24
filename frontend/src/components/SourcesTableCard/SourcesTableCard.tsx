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
import { useHistory } from 'react-router-dom';

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
  const history = useHistory();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const currentUrlParams = new URLSearchParams(window.location.search);
  const page = currentUrlParams.get('page');
  const pageNumber = page ? parseInt(page) : 0;
  localStorage.setItem('offset', (pageNumber * props.limit).toString());
  useEffect(() => {
    if (!props.loading) {
      dispatch(
        fetchSources({ limit: 10, offset: parseInt(localStorage.getItem('offset') || '{}') }),
      );
    }
  }, [pageNumber]);

  const onSearchChange = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    history.push('/sources');
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      const { value } = event.currentTarget as HTMLInputElement;
      setSearchQuery(value || '');
      dispatch(fetchSources({ limit: props.limit, offset: 0, search: value || '' }));
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
    if (page.selected !== 0) {
      currentUrlParams.set('page', (page.selected + 1).toString());
      if (searchQuery) {
        currentUrlParams.set('q', searchQuery);
      }
      history.push(`${window.location.pathname}?${currentUrlParams.toString()}`);
    } else {
      history.push('/sources');
    }
  };

  const renderPagination = (): ReactNode => {
    return (
      <PaginationRow
        pageRangeDisplayed={2}
        limit={props.limit}
        count={props.count}
        pageCount={Math.ceil(props.count / props.limit)}
        onPageChange={onPageChange}
        currentPage={pageNumber === 0 ? 0 : pageNumber - 1}
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

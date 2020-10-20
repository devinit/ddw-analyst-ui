// import { List } from 'immutable';
import React, { FunctionComponent, ReactNode, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { fetchDataSourceHistory } from '../../pages/DataSourceHistory/utils';
import { SourceMap } from '../../types/sources';
import { PaginationRow } from '../PaginationRow';
import * as localForage from 'localforage';
import { localForageKeys } from '../../utils';

interface ComponentProps {
  activeSource?: SourceMap;
  loading: boolean;
  limit: number;
  offset: number;
}

export const SourceHistoryCard: FunctionComponent<ComponentProps> = (props) => {
  useEffect(() => {
    if (!props.loading && props.activeSource) {
      fetchDataSourceHistory(props.activeSource.get('id') as number, {
        limit: props.limit,
        offset: props.offset,
      });
    }

    return function cleanup() {
      localForage.removeItem(localForageKeys.ACTIVE_SOURCE);
    };
  }, []);

  const onPageChange = (page: { selected: number }): void => {
    if (props.activeSource) {
      fetchDataSourceHistory(props.activeSource.get('id') as number, {
        limit: props.limit,
        offset: page.selected * props.limit,
      });
    }
  };

  const renderPagination = (): ReactNode => {
    return (
      <PaginationRow
        pageRangeDisplayed={2}
        limit={props.limit}
        count={1} // TODO: add actual count
        pageCount={Math.ceil(1 / props.limit)}
        onPageChange={onPageChange}
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
          Table Goes Here
          {renderPagination()}
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

SourceHistoryCard.defaultProps = {
  limit: 10,
  offset: 0,
};

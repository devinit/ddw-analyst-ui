// import { List } from 'immutable';
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { fetchDataSourceHistory } from '../../pages/DataSourceHistory/utils';
import { SourceMap } from '../../types/sources';
import { PaginationRow } from '../PaginationRow';
import * as localForage from 'localforage';
import { localForageKeys } from '../../utils';
import { SourceHistoryListItem } from '../SourceHistoryListItem';
import { FrozenData } from '../SourceHistoryListItem/utils';

interface ComponentProps {
  activeSource?: SourceMap;
  loading: boolean;
  limit: number;
  offset: number;
}

export const SourceHistoryCard: FunctionComponent<ComponentProps> = (props) => {
  const [history, setHistory] = useState<FrozenData[]>([]);
  useEffect(() => {
    if (!props.loading && props.activeSource) {
      fetchDataSourceHistory(props.activeSource.get('id') as number, {
        limit: props.limit,
        offset: props.offset,
      });
      setHistory([
        {
          description: 'Testing history card item',
          user: 'edwin.magezi@devinit.org',
          created_on: new Date('August 19, 2018 23:15:30').toISOString(),
        } as FrozenData,
        {
          description: 'Second test ... 234',
          user: 'edwin.magezi@devinit.org',
          created_on: new Date('August 19, 2018 23:15:30').toISOString(),
        } as FrozenData,
      ]);
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

  const renderRows = () => {
    if (history && history.length) {
      return history.map((frozenData, index) => (
        <SourceHistoryListItem key={index} item={frozenData} />
      ));
    }

    return null;
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
      <Card className="dataset-list">
        <Card.Body>{renderRows()}</Card.Body>
        <Card.Footer className="d-block">{renderPagination()}</Card.Footer>
      </Card>
    </React.Fragment>
  );
};

SourceHistoryCard.defaultProps = {
  limit: 10,
  offset: 0,
};

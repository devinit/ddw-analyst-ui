import classNames from 'classnames';
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { Source, SourceMap } from '../../types/sources';
import { clearSourcesCache } from '../../utils/cache';
import { fetchDataSourceHistory } from '../../utils/history';
import { BasicModal, ModalMessage } from '../BasicModal';
import { FrozenDataForm } from '../FrozenDataForm';
import { PaginationRow } from '../PaginationRow';
import { SourceHistoryListItem } from '../SourceHistoryListItem';
import { FrozenData } from '../SourceHistoryListItem/utils';

interface ComponentProps {
  source: SourceMap;
  loading: boolean;
  limit: number;
  offset: number;
}

export const SourceHistoryCard: FunctionComponent<ComponentProps> = (props) => {
  const [history, setHistory] = useState<FrozenData[]>([]);
  const [count, setCount] = useState(0);
  const [modalMessage, setModalMessage] = useState('');
  const [showFrozenDataForm, setShowFrozenDataForm] = useState(false);
  const [selectedPage, setSelectedPage] = useState(1);
  useEffect(() => {
    if (!props.loading && props.source.get('id')) {
      fetchDataSourceHistory(props.source.get('id') as number, {
        limit: props.limit,
        offset: selectedPage === 1 ? 0 : selectedPage * props.limit,
      }).then((response) => {
        if (response.status === 200 || response.status === 201) {
          setHistory(response.data.results);
          setCount(response.data.count || response.data.results.length);
        }
      });
    }
  }, [selectedPage]);

  const onClickFreezeButton = () => {
    setShowFrozenDataForm(true);
  };
  const onCreateFrozenData = (frozenData: FrozenData) => {
    setHistory([frozenData].concat(history));
    setShowFrozenDataForm(false);
    clearSourcesCache();
  };

  const onPageChange = (page: { selected: number }): void => {
    if (props.source) {
      setSelectedPage(page.selected);
    }
  };
  const onDelete = (frozenData: FrozenData): void => {
    setHistory(history.filter((item) => item.id !== frozenData.id));
  };

  const renderRows = () => {
    if (history && history.length) {
      return history.map((frozenData, index) => (
        <SourceHistoryListItem key={index} item={frozenData} onDelete={onDelete} />
      ));
    }

    return null;
  };

  const renderPagination = (): ReactNode => {
    if (history && history.length) {
      return (
        <PaginationRow
          pageRangeDisplayed={2}
          limit={props.limit}
          count={count}
          pageCount={Math.ceil(1 / props.limit)}
          onPageChange={onPageChange}
        />
      );
    }

    return <h5 className="pl-1 pb-2">No results</h5>;
  };

  return (
    <React.Fragment>
      <Dimmer active={props.loading} inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Card className="dataset-list">
        <Card.Header className={classNames({ 'd-none': !props.source })}>
          <h4>{props.source.get('indicator')}</h4>
          <Button
            size="sm"
            variant="danger"
            onClick={onClickFreezeButton}
            data-testid="source-version-freeze-button"
          >
            Freeze Current Version
          </Button>
        </Card.Header>
        <Card.Body className="p-0">{renderRows()}</Card.Body>
        <Card.Footer className="d-block">{renderPagination()}</Card.Footer>

        <Modal show={showFrozenDataForm} size="lg" onHide={() => setShowFrozenDataForm(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              Freeze Current Version of{' '}
              <span className="text-danger">{props.source.get('indicator')}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FrozenDataForm
              source={props.source.toJS() as Source}
              onSave={onCreateFrozenData}
              onCancel={() => setShowFrozenDataForm(false)}
            />
          </Modal.Body>
        </Modal>

        <BasicModal show={!!modalMessage} onHide={() => setModalMessage('')}>
          {modalMessage ? <ModalMessage message={modalMessage} /> : null}
        </BasicModal>
      </Card>
    </React.Fragment>
  );
};

SourceHistoryCard.defaultProps = {
  limit: 10,
  offset: 0,
};

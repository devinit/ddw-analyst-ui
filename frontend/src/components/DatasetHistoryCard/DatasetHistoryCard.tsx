import classNames from 'classnames';
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { OperationMap } from '../../types/operations';
import { fetchOperationHistory } from '../../utils/api/history';
import { BasicModal, ModalMessage } from '../BasicModal';
import { DatasetHistoryListItem } from '../DatasetHistoryListItem';
import { PaginationRow } from '../PaginationRow';
import { SavedQueryData } from './utils/types';

interface ComponentProps {
  dataset: OperationMap;
  loading: boolean;
  limit: number;
  offset: number;
}

export const DatasetHistoryCard: FunctionComponent<ComponentProps> = (props) => {
  const [history, setHistory] = useState<SavedQueryData[]>([]);
  const [modalMessage, setModalMessage] = useState('');
  const [showSavedQueryForm, setShowSavedQueryForm] = useState(false);
  useEffect(() => {
    if (!props.loading && props.dataset.get('id')) {
      fetchOperationHistory(props.dataset.get('id') as number, {
        limit: props.limit,
        offset: props.offset,
      }).then((response) => {
        if (response.status === 200 || response.status === 201) {
          setHistory(response.data.results);
        }
      });
    }
  }, []);

  const onClickFreezeButton = () => {
    setShowSavedQueryForm(true);
  };
  const onCreateSavedQuery = (savedQuery: SavedQueryData) => {
    // TODO: rename to SavedQuery
    setHistory([savedQuery].concat(history));
    setShowSavedQueryForm(false);
  };

  const onPageChange = (page: { selected: number }): void => {
    if (props.dataset) {
      fetchOperationHistory(props.dataset.get('id') as number, {
        limit: props.limit,
        offset: page.selected * props.limit,
      }).then((response) => {
        if (response.status === 200 || response.status === 201) {
          setHistory(response.data.results);
        }
      });
    }
  };
  const onDelete = (frozenData: SavedQueryData): void => {
    setHistory(history.filter((item) => item.id !== frozenData.id));
  };

  const renderRows = () => {
    if (history && history.length) {
      return history.map((frozenData, index) => (
        <DatasetHistoryListItem key={index} item={frozenData} onDelete={onDelete} />
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
        <Card.Header className={classNames({ 'd-none': !props.dataset })}>
          <h4>{props.dataset.get('name')}</h4>
          <Button size="sm" variant="danger" onClick={onClickFreezeButton}>
            Freeze Current Version
          </Button>
        </Card.Header>
        <Card.Body className="p-0">{renderRows()}</Card.Body>
        <Card.Footer className="d-block">{renderPagination()}</Card.Footer>

        <Modal show={showSavedQueryForm} size="lg" onHide={() => setShowSavedQueryForm(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              Freeze Current Version of{' '}
              <span className="text-danger">{props.dataset.get('name')}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>From Goes Here</Modal.Body>
        </Modal>

        <BasicModal show={!!modalMessage} onHide={() => setModalMessage('')}>
          {modalMessage ? <ModalMessage message={modalMessage} /> : null}
        </BasicModal>
      </Card>
    </React.Fragment>
  );
};

DatasetHistoryCard.defaultProps = {
  limit: 10,
  offset: 0,
};

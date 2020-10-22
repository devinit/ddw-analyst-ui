import classNames from 'classnames';
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { Source, SourceMap } from '../../types/sources';
import { fetchDataSourceHistory } from '../../utils/api/history';
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
  const [modalMessage, setModalMessage] = useState('');
  const [showFrozenDataForm, setShowFrozenDataForm] = useState(false);
  useEffect(() => {
    if (!props.loading && props.source.get('id')) {
      fetchDataSourceHistory(props.source.get('id') as number, {
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
    setShowFrozenDataForm(true);
  };
  const onCreateFrozenData = (frozenData: FrozenData) => {
    setHistory([frozenData].concat(history));
    setShowFrozenDataForm(false);
  };

  const onPageChange = (page: { selected: number }): void => {
    if (props.source) {
      fetchDataSourceHistory(props.source.get('id') as number, {
        limit: props.limit,
        offset: page.selected * props.limit,
      }).then((response) => {
        if (response.status === 200 || response.status === 201) {
          setHistory(response.data.results);
        }
      });
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
        <Card.Header className={classNames({ 'd-none': !props.source })}>
          <h4>{props.source.get('indicator')}</h4>
          <Button size="sm" variant="danger" onClick={onClickFreezeButton}>
            Freeze Current Version
          </Button>
        </Card.Header>
        <Card.Body className="p-0">{renderRows()}</Card.Body>
        <Card.Footer className="d-block">{renderPagination()}</Card.Footer>

        <Modal show={showFrozenDataForm} size="lg" onHide={() => setShowFrozenDataForm(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              Freeze Current Version of{' '}
              <span className="text-danger">{props.source.get('source')}</span>
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

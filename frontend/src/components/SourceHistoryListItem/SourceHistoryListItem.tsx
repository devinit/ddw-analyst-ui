import moment from 'moment';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { api } from '../../utils';
import { deleteFrozeData, fetchFrozenData } from '../../utils/history';
import { status, statusClasses } from '../../utils/status';
import { BasicModal } from '../BasicModal';
import { FrozenData } from './utils';

interface ComponentProps {
  item: FrozenData;
  onDelete?: (item: FrozenData) => void;
}

const extractNameFromEmail = (email: string) => email.split('@')[0].split('.').join(' ');

export const SourceHistoryListItem: FunctionComponent<ComponentProps> = (props) => {
  const [item, setItem] = useState(props.item);
  const [deleteStatus, setDeleteStatus] = useState<'default' | 'confirm'>('default');
  const [showLogs, setShowLogs] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => setItem(props.item), [props.item]);
  useEffect(() => {
    if (fetching) {
      fetchFrozenData(item.id)
        .then((results) => {
          if (results.status === 200) {
            setItem(results.data);
          }
          setFetching(false);
        })
        .catch((error) => console.log(error.message));
    }
  }, [fetching, item]);
  const onDelete = () => {
    if (deleteStatus === 'default') {
      setDeleteStatus('confirm');
    } else {
      deleteFrozeData(item.id).then((response) => {
        if (response.status === 204 && props.onDelete) {
          props.onDelete(item);
        }
      });
    }
  };
  const toggleShowLogs = (): void => setShowLogs(!showLogs);
  const onRefresh = (): void => setFetching(true);

  return (
    <>
      <Dimmer active={fetching} inverted>
        <Loader content="Loading" />
      </Dimmer>
      <div className="dataset-row p-3 border-bottom">
        <div className="col-md-12">
          <div className="dataset-row-title h4" data-testid="frozen-data-description">
            {item.description}
          </div>

          <div className="dataset-row-actions float mb-1">
            <Button
              variant="dark"
              size="sm"
              onClick={onRefresh}
              data-testid="frozen-dataset-refresh-button"
            >
              <i className="material-icons">refresh</i>
            </Button>
            {item.logs ? (
              <Button variant="dark" size="sm" onClick={toggleShowLogs}>
                <i className="material-icons">info</i> Info
              </Button>
            ) : null}
            {item.status === 'c' && item.frozen_db_table ? (
              <a
                href={`${api.routes.DOWNLOAD_FROZEN_DATA.replace('{table}', item.frozen_db_table)}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-dark btn-sm"
                data-testid="frozen-source-download-button"
              >
                Download
              </a>
            ) : null}
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              data-testid="frozen-data-delete-button"
            >
              <i className="material-icons">delete</i>{' '}
              {deleteStatus === 'default' ? 'Delete' : 'Confirm Delete'}
            </Button>
          </div>

          <div className="h6 dataset-row-footer">
            Created {moment(item.created_on).fromNow()}
            {' by '}
            <span>{extractNameFromEmail(item.user || '')}</span>
            <span
              className={`badge ml-2 ${statusClasses[item.status]}`}
              data-testid="frozen-data-status"
            >
              {status[item.status]}
            </span>
          </div>
        </div>
        <BasicModal show={showLogs} onHide={toggleShowLogs}>
          {item.logs}
        </BasicModal>
      </div>
    </>
  );
};

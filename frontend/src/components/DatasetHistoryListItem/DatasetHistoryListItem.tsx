import moment from 'moment';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { api } from '../../utils';
import { deleteSavedQueryData, fetchSavedQueryData } from '../../utils/history';
import { status, statusClasses } from '../../utils/status';
import { BasicModal } from '../BasicModal';
import { SavedQueryData } from '../DatasetHistoryCard/utils/types';

interface ComponentProps {
  item: SavedQueryData;
  onDelete?: (item: SavedQueryData) => void;
}

const extractNameFromEmail = (email: string) => email.split('@')[0].split('.').join(' ');

export const DatasetHistoryListItem: FunctionComponent<ComponentProps> = (props) => {
  const [item, setItem] = useState(props.item);
  const [deleteStatus, setDeleteStatus] = useState<'default' | 'confirm'>('default');
  const [showLogs, setShowLogs] = useState(false);
  const [fetching, setFetching] = useState(false);
  useEffect(() => {
    if (fetching) {
      fetchSavedQueryData(item.id)
        .then((result) => {
          if (result.status === 200) {
            setItem(result.data);
          }
          setFetching(false);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }, [fetching, item]);
  useEffect(() => {
    setItem(props.item);
  }, [props.item]);
  const onDelete = () => {
    if (deleteStatus === 'default') {
      setDeleteStatus('confirm');
    } else {
      deleteSavedQueryData(item.id).then((response) => {
        if (response.status === 204 && props.onDelete) {
          props.onDelete(item);
        }
        setDeleteStatus('default');
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
      <div className="dataset-row p-3 border-bottom" data-testid="datasetRows">
        <div className="col-md-12">
          <div className="dataset-row-title h4">{item.description}</div>

          <div className="dataset-row-actions float mb-1">
            <Button
              size="sm"
              variant="dark"
              onClick={onRefresh}
              data-testid="dataset-frozen-data-refresh-button"
            >
              <i className="material-icons">refresh</i>
            </Button>
            {item.logs ? (
              <Button
                variant="dark"
                size="sm"
                onClick={toggleShowLogs}
                data-testid="frozen-dataset-info-button"
              >
                <i className="material-icons">info</i> Logs
              </Button>
            ) : null}
            {item.status === 'c' ? (
              <a
                href={`${api.routes.DOWNLOAD_SAVED_QUERYSET.replace(
                  '{table}',
                  item.saved_query_db_table,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-dark btn-sm"
                data-testid="frozen-dataset-download-button"
              >
                Download
              </a>
            ) : null}
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              data-testid="frozen-dataset-delete-button"
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
              data-testid="dataset-frozen-data-status"
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

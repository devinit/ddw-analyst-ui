import moment from 'moment';
import React, { FunctionComponent, useState } from 'react';
import { Button } from 'react-bootstrap';
import { deleteSavedQueryData } from '../../utils/history';
import { status, statusClasses } from '../../utils/status';
import { SavedQueryData } from '../DatasetHistoryCard/utils/types';
import { BasicModal } from '../BasicModal';
import { api } from '../../utils';
import { target } from 'glamor';

interface ComponentProps {
  item: SavedQueryData;
  onDelete?: (item: SavedQueryData) => void;
}

const extractNameFromEmail = (email: string) => email.split('@')[0].split('.').join(' ');

export const DatasetHistoryListItem: FunctionComponent<ComponentProps> = ({ item, ...props }) => {
  const [deleteStatus, setDeleteStatus] = useState<'default' | 'confirm'>('default');
  const [showLogs, setShowLogs] = useState(false);
  const onDelete = () => {
    if (deleteStatus === 'default') {
      setDeleteStatus('confirm');
    } else {
      deleteSavedQueryData(item.id).then((response) => {
        if (response.status === 204 && props.onDelete) {
          props.onDelete(item);
        }
      });
    }
  };
  const toggleShowLogs = (): void => {
    setShowLogs(!showLogs);
  };

  return (
    <div className="dataset-row p-3 border-bottom">
      <div className="col-md-12">
        <div className="dataset-row-title h4">{item.description}</div>

        <div className="dataset-row-actions float mb-1">
          {item.logs ? (
            <Button variant="dark" size="sm" onClick={toggleShowLogs}>
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
            >
              Download
            </a>
          ) : null}
          <Button variant="danger" size="sm" onClick={onDelete}>
            <i className="material-icons">delete</i>{' '}
            {deleteStatus === 'default' ? 'Delete' : 'Confirm Delete'}
          </Button>
        </div>

        <div className="h6 dataset-row-footer">
          Created {moment(item.created_on).fromNow()}
          {' by '}
          <span>{extractNameFromEmail(item.user || '')}</span>
          <span className={`badge ml-2 ${statusClasses[item.status]}`}>{status[item.status]}</span>
        </div>
      </div>
      <BasicModal show={showLogs} onHide={toggleShowLogs}>
        {item.logs}
      </BasicModal>
    </div>
  );
};

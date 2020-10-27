import moment from 'moment';
import React, { FunctionComponent, useState } from 'react';
import { Button } from 'react-bootstrap';
import { status, statusClasses } from '../../utils/status';
import { SavedQueryData } from '../DatasetHistoryCard/utils/types';

interface ComponentProps {
  item: SavedQueryData;
  onDelete?: (item: SavedQueryData) => void;
}

const extractNameFromEmail = (email: string) => email.split('@')[0].split('.').join(' ');

export const DatasetHistoryListItem: FunctionComponent<ComponentProps> = ({ item }) => {
  const [deleteStatus, setDeleteStatus] = useState<'default' | 'confirm'>('default');
  const onDelete = () => {
    if (deleteStatus === 'default') {
      setDeleteStatus('confirm');
    } else {
      // TODO: Delete Saved Query Data
    }
  };

  return (
    <div className="dataset-row p-3 border-bottom">
      <div className="col-md-12">
        <div className="dataset-row-title h4">{item.description}</div>

        <div className="dataset-row-actions float mb-1">
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
    </div>
  );
};

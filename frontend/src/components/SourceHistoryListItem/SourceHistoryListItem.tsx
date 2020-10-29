import moment from 'moment';
import React, { FunctionComponent, useState } from 'react';
import { status, statusClasses } from '../../utils/status';
import { FrozenData } from './utils';
import { Button } from 'react-bootstrap';
import { deleteFrozeData } from '../../utils/history';
import { BasicModal } from '../BasicModal';

interface ComponentProps {
  item: FrozenData;
  onDelete?: (item: FrozenData) => void;
}

const extractNameFromEmail = (email: string) => email.split('@')[0].split('.').join(' ');

export const SourceHistoryListItem: FunctionComponent<ComponentProps> = ({ item, ...props }) => {
  const [deleteStatus, setDeleteStatus] = useState<'default' | 'confirm'>('default');
  const [showLogs, setShowLogs] = useState(false);
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
  const toggleShowLogs = (): void => {
    setShowLogs(!showLogs);
  };

  return (
    <div className="dataset-row p-3 border-bottom">
      <div className="col-md-12">
        <div className="dataset-row-title h4">{item.description}</div>

        <div className="dataset-row-actions float mb-1">
          <Button variant="dark" size="sm" onClick={toggleShowLogs}>
            <i className="material-icons">info</i> Info
          </Button>
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

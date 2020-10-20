import moment from 'moment';
import React, { FunctionComponent } from 'react';
import { FrozenData } from './utils';

interface ComponentProps {
  item: FrozenData;
}

const extractNameFromEmail = (email: string) => email.split('@')[0].split('.').join(' ');

export const SourceHistoryListItem: FunctionComponent<ComponentProps> = ({ item }) => {
  return (
    <div className="dataset-row p-3 border-bottom">
      <div className="col-md-12">
        <div className="dataset-row-title h4">{item.description}</div>

        <div className="dataset-row-actions mb-1">{}</div>

        <div className="h6 dataset-row-footer">
          Created {moment(item.created_on).fromNow()}
          {' by '}
          <span>{extractNameFromEmail(item.user || '')}</span>
        </div>
      </div>
    </div>
  );
};

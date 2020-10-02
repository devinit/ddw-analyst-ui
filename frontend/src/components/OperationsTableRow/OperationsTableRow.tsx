import classNames from 'classnames';
import { List } from 'immutable';
import moment from 'moment';
import React, { FunctionComponent, useEffect } from 'react';
import { OperationMap, OperationStepMap } from '../../types/operations';
import { OperationsTableRowActions } from '../OperationsTableRowActions';
import { fetchSource } from './utils';

export interface OperationsTableRowProps {
  operation: OperationMap;
  showDraftBadge?: boolean;
}

export const OperationsTableRow: FunctionComponent<OperationsTableRowProps> = ({
  operation,
  showDraftBadge,
  ...props
}) => {
  const [source, setSource] = React.useState('');

  useEffect(() => {
    const sourceId = (operation.get('operation_steps') as List<OperationStepMap>).map((a) =>
      a.get('source'),
    );
    if (sourceId.get(0)) {
      fetchSource(sourceId.get(0) as number).then((response) => {
        if (response.status === 201 || response.status === 200) {
          if (!response.data.hasOwnProperty('error')) {
            setSource(response.data.source);
          }
        }
      });
    }
  }, []);

  const renderActions = (): React.ReactNode =>
    React.Children.map(props.children, (child) => {
      if (React.isValidElement(child) && child.type === OperationsTableRowActions) {
        return child;
      }
    });

  return (
    <div className="dataset-row p-3 border-bottom">
      <div className="col-md-12">
        <div className="dataset-row-title h4">
          {operation.get('name')}
          {showDraftBadge && operation.get('is_draft') ? (
            <span data-testid="draft-span" className="badge badge-warning align-middle ml-2">
              Draft
            </span>
          ) : null}
        </div>
        <p className={classNames('mb-2', { 'd-none': !operation.get('description') })}>
          {operation.get('description')}
        </p>

        <div className="dataset-row-actions mb-1">{renderActions()}</div>

        <div className="h6 dataset-row-footer">
          Updated {moment(operation.get('updated_on') as string).fromNow()}
          {` from `}
          <span className="text-uppercase text-danger">{source}</span>
        </div>
      </div>
    </div>
  );
};

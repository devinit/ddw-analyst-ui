import classNames from 'classnames';
import { List } from 'immutable';
import moment from 'moment';
import React, { FunctionComponent, useContext, useEffect } from 'react';
import { SourcesContext } from '../../context';
import { OperationMap, OperationStepMap } from '../../types/operations';
import { OperationsTableRowActions } from '../OperationsTableRowActions';

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
  const { sources } = useContext(SourcesContext);

  useEffect(() => {
    const source = (operation.get('operation_steps') as List<OperationStepMap>)
      .map((a) => a.get('source'))
      .first<string>();
    if (source) {
      const matchingSource = sources.find((src) => src.get('id') === source);
      if (matchingSource) {
        setSource(matchingSource.get('indicator') as string);
      }
    }
  }, [sources]);

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

import { List } from 'immutable';
import React, { FunctionComponent, useEffect } from 'react';
import { DatasetRowItem } from '../DatasetRowItem';
import { OperationsTableRowActions } from '../OperationsTableRowActions';
import { OperationStepMap } from '../../types/operations';
import { fetchSource } from './utils';
import moment from 'moment';

export interface OperationsTableRowProps {
  count: number;
  name: string;
  updatedOn: string;
  isDraft: boolean;
  classNames?: string;
  description?: string;
  user?: string;
  updated_on: string;
  operation_steps: List<OperationStepMap>;
}

export const OperationsTableRow: FunctionComponent<OperationsTableRowProps> = (props) => {
  const [source, setSource] = React.useState('');

  const sourceId = props.operation_steps.map((a) => {
    return a.get('source');
  });

  useEffect(() => {
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
        <DatasetRowItem text={props.name} addClass="dataset-row-title h4">
          {props.isDraft ? (
            <span data-testid="draft-span" className="badge badge-warning align-middle">
              Draft
            </span>
          ) : null}
        </DatasetRowItem>
        <DatasetRowItem addClass="mb-2" text={props.description}></DatasetRowItem>

        <DatasetRowItem addClass="dataset-row-actions mb-1">{renderActions()}</DatasetRowItem>

        <DatasetRowItem addClass="h6 dataset-row-footer" text="Updated">
          {moment(props.updated_on).fromNow()}
          {` by `}
          <span> {props.user} </span>
          {`from `}
          <span className="text-uppercase text-danger">{source}</span>
        </DatasetRowItem>
      </div>
    </div>
  );
};

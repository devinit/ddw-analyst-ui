import { List } from 'immutable';
import React, { FunctionComponent } from 'react';
import { DatasetRowItem } from '../DatasetRowItem';
import { OperationsTableRowActions } from '../OperationsTableRowActions';
import TimeAgo from 'timeago-react';
import { OperationStepMap } from '../../types/operations';
import { fetchSource } from './utils';

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
  const renderActions = (): React.ReactNode =>
    React.Children.map(props.children, (child) => {
      if (React.isValidElement(child) && child.type === OperationsTableRowActions) {
        return child;
      }
    });

  const sourceId = props.operation_steps.map((a) => {
    return a.get('source');
  });

  fetchSource(sourceId.get(0) as number)
    .then((response) => {
      if (response.status === 201 || response.status === 200) {
        if (!response.data.hasOwnProperty('error')) {
          setSource(response.data.source);
        }
      } else {
        console.log(`response not 201 ${JSON.stringify(response.data)}`);
      }
    })
    .catch((error) => {
      console.log(`response error ${JSON.stringify(error)}`);
    });

  return (
    <div className="dataset-row p-3 border-bottom">
      <div className="col-md-12">
        <DatasetRowItem text={props.name} addClass="dataset-row-title h4">
          {props.isDraft ? <span className="badge badge-warning align-middle">Draft</span> : null}
        </DatasetRowItem>
        <DatasetRowItem addClass="mb-2" text={props.description}></DatasetRowItem>

        <DatasetRowItem addClass="dataset-row-actions mb-1">{renderActions()}</DatasetRowItem>

        <DatasetRowItem addClass="h6 dataset-row-footer" text="Updated">
          <TimeAgo datetime={props.updated_on} locale="en" />
          {` by `}
          <span> {props.user} </span>
          {`from `}
          <span className="text-uppercase text-danger">{source}</span>
        </DatasetRowItem>
      </div>
    </div>
  );
};

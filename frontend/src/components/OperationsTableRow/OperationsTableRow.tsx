import React, { FunctionComponent } from 'react';
import { DatasetRowItem } from '../DatasetRowItem';
import { OperationsTableRowActions } from '../OperationsTableRowActions';

export interface OperationsTableRowProps {
  count: number;
  name: string;
  updatedOn: string;
  isDraft: boolean;
  classNames?: string;
  description?: string;
  user?: string;
}

export const OperationsTableRow: FunctionComponent<OperationsTableRowProps> = (props) => {
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
          {props.isDraft ? <span className="badge badge-warning align-middle">Draft</span> : null}
        </DatasetRowItem>
        <DatasetRowItem addClass="mb-2" text={props.description}></DatasetRowItem>

        <DatasetRowItem addClass="dataset-row-actions mb-1">{renderActions()}</DatasetRowItem>

        <DatasetRowItem addClass="h6 dataset-row-footer" text="Updated 2 days ago by">
          <span>{props.user}</span> from <span className="text-uppercase text-danger">yolo</span>
        </DatasetRowItem>
      </div>
    </div>
  );
};

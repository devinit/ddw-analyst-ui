import React, { FunctionComponent } from 'react';
import { DatasetCardBody } from '../DatasetCardBody';

export const OperationsTable: FunctionComponent = (props) => {
  const renderRows = () =>
    React.Children.map(props.children, (child) => {
      if (React.isValidElement(child)) {
        return child;
      }
    });

  return (
    <div className="card dataset-list">
      <DatasetCardBody removePadding={true}>{renderRows()}</DatasetCardBody>
    </div>
  );
};

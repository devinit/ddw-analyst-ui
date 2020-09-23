import React, { FunctionComponent } from 'react';

export const OperationsTable: FunctionComponent = (props) => {
  const renderRows = () =>
    React.Children.map(props.children, (child) => {
      if (React.isValidElement(child) && child.type) {
        return child;
      }
    });

  return (
    <div className="card dataset-list">
      <div className="card-body p-0">{renderRows()}</div>
    </div>
  );
};

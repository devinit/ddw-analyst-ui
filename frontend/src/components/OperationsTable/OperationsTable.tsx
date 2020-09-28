import React, { FunctionComponent } from 'react';
import { BasicModal } from '../BasicModal';
import { DatasetCardBody } from '../DatasetCardBody';
import { DatasetCardFooter } from '../DatasetCardFooter';
import { OperationsTableRow } from '../OperationsTableRow';

export const OperationsTable: FunctionComponent = (props) => {
  const renderRows = () =>
    React.Children.map(props.children, (child) => {
      if (
        React.isValidElement(child) &&
        (child.type === DatasetCardBody ||
          child.type === OperationsTableRow ||
          child.type === DatasetCardFooter ||
          child.type === BasicModal)
      ) {
        return child;
      }
    });

  return (
    <div className="card dataset-list">
      <DatasetCardBody removePadding={true}>{renderRows()}</DatasetCardBody>
    </div>
  );
};

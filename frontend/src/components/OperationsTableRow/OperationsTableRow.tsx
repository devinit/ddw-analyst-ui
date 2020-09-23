import React, { FunctionComponent } from 'react';
// import styled from 'styled-components';
// import OperationsTableRowActions from '../OperationsTableRowActions';
// import { Badge } from 'react-bootstrap';

export interface OperationsTableRowProps {
  count: number;
  name: string;
  updatedOn: string;
  isDraft: boolean;
  classNames?: string;
}

// const StyledActionCell = styled.td`
//   display: block !important;
// `;

export const OperationsTableRow: FunctionComponent<OperationsTableRowProps> = () => {
  // const renderActions = (): React.ReactNode =>
  //   React.Children.map(props.children, (child) => {
  //     if (React.isValidElement(child) && child.type === OperationsTableRowActions) {
  //       return child;
  //     }
  //   });

  return (
    <>
      <div className="dataset-row p-3 border-bottom">
        <div className="col-md-12">
          <div className="dataset-row-title h4">
            Hola <span className="badge badge-warning align-middle">Draft</span>
          </div>
          <p className="mb-2">Lets rock people we got this</p>
          <div className="dataset-row-actions mb-1">
            <button className="btn btn-sm btn-dark">Edit</button>
            <button className="btn btn-sm btn-dark">Preview Data</button>
            <button className="btn btn-sm btn-dark" data-toggle="modal" data-target="#queryModal">
              SQL Query
            </button>
            <button className="btn btn-sm btn-dark">Export to CSV</button>
          </div>

          <div className="h6 dataset-row-footer">
            Updated 2 days ago by <span>Edwin P. Magezi</span> from{' '}
            <span className="text-uppercase text-danger">yolo</span>
          </div>
        </div>
      </div>
    </>
  );
};

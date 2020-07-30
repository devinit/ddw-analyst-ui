import classNames from 'classnames';
import React from 'react';
import { Button } from 'react-bootstrap';
export interface SourcesTableRowProps {
  classNames?: string;
  indicator: string;
  indicatorAcronym: string;
  updatedOn: string;
  onDatasetClick: (() => void) | undefined;
  onMetadataClick: (() => void) | undefined;
}

export const SourcesTableRow: React.SFC<SourcesTableRowProps> = (props) => {
  return (
    <tr className={props.classNames}>
      <td>
        {props.indicator}
        <span className={classNames('text-uppercase', { 'd-none': !props.indicatorAcronym })}>
          {` (${props.indicatorAcronym})`}
        </span>
      </td>
      <td>{new Date(props.updatedOn).toDateString()}</td>
      <td>
        <Button
          variant="outline-success"
          size="sm"
          onClick={props.onMetadataClick}
          data-testid="sources-table-row"
        >
          Metadata
        </Button>
        <Button variant="outline-success" size="sm" onClick={props.onDatasetClick}>
          Datasets
        </Button>
      </td>
    </tr>
  );
};

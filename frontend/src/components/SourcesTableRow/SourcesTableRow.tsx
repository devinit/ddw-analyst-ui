import classNames from 'classnames';
import * as React from 'react';
import { Button } from 'react-bootstrap';
export interface SourcesTableRowProps {
  classNames?: string;
  onClick: () => void;
  indicator: string;
  indicatorAcronym: string;
  updatedOn: string;
}

export const SourcesTableRow: React.SFC<SourcesTableRowProps> = (props) => {
  return (
    <tr className={props.classNames} data-testid="sources-table-row">
      <td>
        {props.indicator}
        <span className={classNames('text-uppercase', { 'd-none': !props.indicatorAcronym })}>
          {` (${props.indicatorAcronym})`}
        </span>
      </td>
      <td>{new Date(props.updatedOn).toDateString()}</td>
      <td>
        <Button variant="outline-success" size="sm" onClick={props.onClick}>
          Metadata
        </Button>
        <Button variant="outline-success" size="sm">
          Datasets
        </Button>
      </td>
    </tr>
  );
};

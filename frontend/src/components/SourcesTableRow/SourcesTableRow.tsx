import classNames from 'classnames';
import * as React from 'react';

export interface SourcesTableRowProps {
  classNames?: string;
  onClick: () => void;
  indicator: string;
  indicatorAcronym: string;
  updatedOn: string;
}

export const SourcesTableRow: React.SFC<SourcesTableRowProps> = (props) => {
  return (
    <tr className={props.classNames} onClick={props.onClick} data-testid="sources-table-row">
      <td>
        {props.indicator}
        <span className={classNames('text-uppercase', { 'd-none': !props.indicatorAcronym })}>
          {` (${props.indicatorAcronym})`}
        </span>
      </td>
      <td>{new Date(props.updatedOn).toDateString()}</td>
    </tr>
  );
};

import * as React from 'react';
import { Dataset } from '../../types/datasets';

interface ComponentProps {
  classNames?: string;
  onClick: () => void;
  dataset: Dataset;
}
export const DatasetTableRow: React.SFC<ComponentProps> = ({ classNames, dataset, onClick }) => {
  return (
    <tr className={ classNames } onClick={ onClick } data-testid="datasets-table-row">
      <td>{ dataset.title }</td>
      <td>{ dataset.publication }</td>
      <td>{ new Date(dataset.releasedAt).toDateString() }</td>
      <td>Actions Go Here!</td>
    </tr>
  );
};

export { DatasetTableRow as default };

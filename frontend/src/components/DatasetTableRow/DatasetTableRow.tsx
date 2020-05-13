import * as React from 'react';
import { Dataset } from '../../types/datasets';

interface ComponentProps {
  classNames?: string;
  dataset: Dataset;
}
export const DatasetTableRow: React.SFC<ComponentProps> = ({ children, classNames, dataset }) => {
  const renderActions = (): React.ReactNode =>
    React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return child;
      }
    });

  return (
    <tr className={classNames} data-testid="datasets-table-row">
      <td>{dataset.title}</td>
      <td>{dataset.publication}</td>
      <td>{new Date(dataset.releasedAt).toDateString()}</td>
      <td className="td-actions text-right">{renderActions()}</td>
    </tr>
  );
};

export { DatasetTableRow as default };

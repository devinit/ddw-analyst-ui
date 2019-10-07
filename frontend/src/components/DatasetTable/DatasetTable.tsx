import * as React from 'react';
import { Table } from 'react-bootstrap';
import { DatasetTableRow } from '../DatasetTableRow';
import { Dataset, DatasetList, DatasetMap } from '../../types/datasets';

interface ComponentProps {
  datasets: DatasetList;
  activeDataset?: DatasetMap;
  onRowClick: (dataset: DatasetMap) => void;
}

export const DatasetTable: React.SFC<ComponentProps> = props => {
  const renderRows = () => {
    if (props.datasets && props.datasets.size) {
      return props.datasets.map((dataset, index) => {
        return (
          <DatasetTableRow
            key={ index }
            onClick={ () => props.onRowClick(dataset) }
            dataset={ dataset.toJS() as Dataset }
          />
        );
      });
    }

    return null;
  };

  return (
    <Table responsive hover striped className="sources-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Publication</th>
          <th>Release Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        { renderRows() }
      </tbody>
    </Table>
  );
};

export { DatasetTable as default };

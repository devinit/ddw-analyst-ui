import { List } from 'immutable';
import React, { useContext, FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { SourceMap } from '../../types/sources';
import { SourcesTableRow } from '../SourcesTableRow';
import { DataSourcesContext, DataSource } from '../../pages/DataSources/DataSources';

interface SourcesTableProps {
  sources: List<SourceMap>;
  activeSource?: SourceMap;
}
export const SourcesTable: FunctionComponent<SourcesTableProps> = (props) => {
  const { onMetadataClick, onDatasetClick } = useContext<DataSource>(DataSourcesContext);

  const renderRows = (sources: List<SourceMap>, activeSource?: SourceMap) => {
    if (sources && sources.size && activeSource) {
      return sources.map((source, index) => (
        <SourcesTableRow
          key={index}
          indicator={source.get('indicator') as string}
          indicatorAcronym={source.get('indicator_acronym') as string}
          updatedOn={source.get('last_updated_on') as string}
          onDatasetClick={onDatasetClick ? () => onDatasetClick(source, source.get('id')) : undefined}
          onMetadataClick={onMetadataClick ? () => onMetadataClick(source) : undefined}
        />
      ));
    }

    return null;
  };

  return (
    <Table responsive hover striped className="sources-table">
      <thead>
        <tr>
          <th>Indicator</th>
          <th>Updated On</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>{renderRows(props.sources, props.activeSource)}</tbody>
    </Table>
  );
};

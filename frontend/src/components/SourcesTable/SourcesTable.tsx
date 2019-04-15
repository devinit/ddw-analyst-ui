import classNames from 'classnames';
import { List } from 'immutable';
import * as React from 'react';
import { Table } from 'react-bootstrap';
import { SourceMap } from '../../types/sources';
import { SourcesTableRow } from '../SourcesTableRow';

interface SourcesTableProps {
  sources: List<SourceMap>;
  activeSource?: SourceMap;
  onRowClick: (source: SourceMap) => void;
}

export class SourcesTable extends React.Component<SourcesTableProps> {
  render() {
    return (
      <Table responsive hover striped className="sources-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Indicator</th>
            <th>Updated On</th>
          </tr>
        </thead>
        <tbody>
          { this.renderRows(this.props.sources, this.props.activeSource) }
        </tbody>
      </Table>
    );
  }

  private renderRows(sources: List<SourceMap>, activeSource?: SourceMap) {
    if (sources && sources.size && activeSource) {
      return sources.map((source, index) => (
        <SourcesTableRow
          key={ index }
          count={ index + 1 }
          classNames={ classNames({ 'table-danger':  activeSource.get('id') === source.get('id') }) }
          onClick={ () => this.props.onRowClick(source) }
          indicator={ source.get('indicator') as string }
          indicatorAcronym={ source.get('indicator_acronym') as string }
          updatedOn={ source.get('last_updated_on') as string }
        />
      ));
    }

    return null;
  }
}

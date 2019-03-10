import classNames from 'classnames';
import { List } from 'immutable';
import * as React from 'react';
import { Card, Table } from 'react-bootstrap';
import { SourceMap } from '../../reducers/sources';
import { SourcesTableRow } from '../SourcesTableRow';

interface SourcesTableProps {
  sources: List<SourceMap>;
  activeSourceIndex: number;
  onRowClick: (index: number) => void;
}

export class SourcesTable extends React.Component<SourcesTableProps> {
  render() {
    return (
      <Card>
        <Card.Body>

          <Table responsive hover striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Indicator</th>
                <th>Updated On</th>
              </tr>
            </thead>
            <tbody>
              { this.renderRows(this.props.sources, this.props.activeSourceIndex) }
            </tbody>
          </Table>

        </Card.Body>
      </Card>
    );
  }

  private renderRows(sources: List<SourceMap>, activeSourceIndex: number) {
    if (sources && sources.size) {
      return sources.map((source, index) => (
        <SourcesTableRow
          key={ index }
          count={ index + 1 }
          classNames={ classNames({ 'table-danger':  activeSourceIndex === index }) }
          onClick={ () => this.props.onRowClick(index) }
          indicator={ source.get('indicator') as string }
          indicatorAcronym={ source.get('indicator_acronym') as string }
          updatedOn={ source.get('last_updated_on') as string }
        />
      ));
    }

    return null;
  }
}

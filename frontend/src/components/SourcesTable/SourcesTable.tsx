import classNames from 'classnames';
import { List } from 'immutable';
import { debounce } from 'lodash';
import * as React from 'react';
import { Card, FormControl, Table } from 'react-bootstrap';
import { SourceMap } from '../../reducers/sources';
import { SourcesTableRow } from '../SourcesTableRow';

interface SourcesTableProps {
  sources: List<SourceMap>;
  activeSource?: SourceMap;
  onRowClick: (source: SourceMap) => void;
}

interface SourcesTableState {
  sources: List<SourceMap>;
  searchQuery: string;
}

export class SourcesTable extends React.Component<SourcesTableProps, SourcesTableState> {
  state: SourcesTableState = {
    sources: this.props.sources,
    searchQuery: ''
  };

  static querySources(sources: List<SourceMap>, searchQuery: string) {
    return sources.filter(source => {
      const inIndicator = (source.get('indicator') as string).toLowerCase().indexOf(searchQuery) > -1;
      const inAcronym = (source.get('indicator_acronym') as string).toLowerCase().indexOf(searchQuery) > -1;

      return inIndicator || inAcronym;
    });
  }

  static getDerivedStateFromProps(props: SourcesTableProps, state: SourcesTableState): SourcesTableState | null {
    if (state.searchQuery) {
      const sources = SourcesTable.querySources(props.sources, state.searchQuery);
      if (sources.count()) {
        props.onRowClick(sources.get(0) as SourceMap);
      }

      return {
        sources,
        searchQuery: state.searchQuery
      };
    } else {
      const count = props.sources.count();
      if (count !== state.sources.count()) {
        props.onRowClick(props.sources.get(0) as SourceMap);

        return {
          sources: props.sources,
          searchQuery: state.searchQuery
        };
      }
    }

    return null;
  }

  render() {
    return (
      <Card>
        <Card.Body>
          <Card.Header>
            <FormControl
              placeholder="Search ..."
              className="w-50"
              onChange={ debounce(this.onSearchChange, 1000, { leading: true }) }
            />
          </Card.Header>
          <Table responsive hover striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Indicator</th>
                <th>Updated On</th>
              </tr>
            </thead>
            <tbody>
              { this.renderRows(this.state.sources, this.props.activeSource) }
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  }

  private renderRows(sources: List<SourceMap>, activeSource?: SourceMap) {
    if (sources && sources.size && activeSource) {
      return sources.map((source, index) => (
        <SourcesTableRow
          key={ index }
          count={ index + 1 }
          classNames={ classNames({ 'table-danger':  activeSource.get('pk') === source.get('pk') }) }
          onClick={ () => this.props.onRowClick(source) }
          indicator={ source.get('indicator') as string }
          indicatorAcronym={ source.get('indicator_acronym') as string }
          updatedOn={ source.get('last_updated_on') as string }
        />
      ));
    }

    return null;
  }

  private onSearchChange = (event: React.FormEvent<any>) => {
    const { value: searchQuery } = event.currentTarget as HTMLInputElement;
    if (searchQuery) {
      this.setState({ searchQuery });
    } else {
      this.setState({ searchQuery: '' });
    }
  }
}

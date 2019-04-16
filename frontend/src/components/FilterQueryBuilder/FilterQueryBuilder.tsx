import { List, Map } from 'immutable';
import * as React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { DropdownItemProps } from 'semantic-ui-react';
import { FilterMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { formatString } from '../../utils';
import { FilterItem } from '../FilterItem';

interface FilterQueryBuilderProps {
  source: SourceMap;
  filters?: List<FilterMap>;
  onUpdateFilters?: (filters: string) => void;
}

interface FilterQueryBuilderState {
  showInfo: boolean;
}

export class FilterQueryBuilder extends React.Component<FilterQueryBuilderProps, FilterQueryBuilderState> {
  state: FilterQueryBuilderState = { showInfo: false };
  private operations = [
    { key: 'lt', text: 'is Less Than', value: 'lt' },
    { key: 'le', text: 'is Less Than Or Equals', value: 'le' },
    { key: 'eq', text: 'is Equals', value: 'eq' },
    { key: 'ne', text: 'is Not Equals', value: 'ne' },
    { key: 'gt', text: 'is Greater Than', value: 'gt' },
    { key: 'ge', text: 'is Greater Than Or Equals', value: 'ge' },
    { key: 'text_search', text: 'Contains', value: 'text_search' }
  ];

  render() {
    return (
      <div>
        { this.renderFilters(this.props.source, this.props.filters) }
        <Button variant="danger" size="sm" onClick={ this.addFilter }>
          <i className="material-icons mr-1">add</i>
          Add Filter
        </Button>
        <Button variant="secondary" size="sm" onClick={ this.toggleInfo }>
          <i className="material-icons">info</i>
        </Button>
        <Alert variant="info" hidden={ !this.state.showInfo }>
          Multiple filter options on the same step translate as an OR operation
          (rows that match one of them are returned), while adding multiple filter steps on an
          operation translates as an AND (rows that match both are returned).
        </Alert>
      </div>
    );
  }

  private renderFilters(source: SourceMap, filters?: List<FilterMap>) {
    if (filters) {
      return filters.map((filter, index) =>
        <FilterItem
          key={ index }
          columns={ this.getSelectColumnsFromSource(source) }
          operations={ this.operations }
          filter={ filter }
          onUpdate={ (filtr: FilterMap) => this.onUpdateItem(filtr, index) }
          onDelete={ () => this.onDeleteItem(index) }
        />
      );
    }

    return null;
  }

  private getSelectColumnsFromSource(source: SourceMap): DropdownItemProps[] {
    const columns = source.get('columns') as ColumnList;
    if (columns && columns.count()) {
      return columns.map(column => ({
        key: column.get('id'),
        text: formatString(column.get('name') as string),
        value: column.get('name')
      })).toJS();
    }

    return [];
  }

  private addFilter = () => {
    if (this.props.onUpdateFilters) {
      const filter: FilterMap = Map({} as any);
      if (this.props.filters) {
        const filters = this.props.filters.push(filter);
        this.props.onUpdateFilters(JSON.stringify(Map({ filters } as any).toJS()));
      } else {
        const filters = Map({ filters: List([ filter ]) }).toJS();
        this.props.onUpdateFilters(JSON.stringify(filters));
      }
    }
  }

  private onUpdateItem = (filter: FilterMap, index: number) => {
    if (this.props.filters && this.props.onUpdateFilters) {
      const filters = this.props.filters.set(index, filter);
      this.props.onUpdateFilters(JSON.stringify(Map({ filters } as any).toJS()));
    }
  }

  private onDeleteItem(index: number) {
    if (this.props.filters && this.props.onUpdateFilters) {
      const filters = this.props.filters.delete(index);
      this.props.onUpdateFilters(JSON.stringify(Map({ filters } as any).toJS()));
    }
  }

  private toggleInfo = () => {
    this.setState({ showInfo: !this.state.showInfo });
  }
}

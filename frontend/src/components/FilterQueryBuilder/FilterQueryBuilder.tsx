import { List, Map } from 'immutable';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { DropdownItemProps } from 'semantic-ui-react';
import { ColumnList, SourceMap } from '../../reducers/sources';
import { FilterMap } from '../../types/query-builder';
import FilterItem from '../FilterItem/FilterItem';

interface FilterQueryBuilderProps {
  source: SourceMap;
  filters?: List<FilterMap>;
  onUpdateFilters?: (filters: string) => void;
}

export class FilterQueryBuilder extends React.Component<FilterQueryBuilderProps> {
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
        key: column.get('pk'),
        text: column.get('source_name'),
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
}

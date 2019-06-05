import { List, Map, Set } from 'immutable';
import * as React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { DropdownItemProps } from 'semantic-ui-react';
import { FilterMap, OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns, sortObjectArrayByProperty } from '../../utils';
import { FilterItem } from '../FilterItem';
import { QueryBuilderHandlerStatic as QueryBuilderHandler } from '../QueryBuilderHandler';

interface FilterQueryBuilderProps {
  source: SourceMap;
  filters?: List<FilterMap>;
  editable?: boolean;
  step: OperationStepMap;
  steps: List<OperationStepMap>;
  onUpdateFilters?: (filters: string) => void;
}

interface FilterQueryBuilderState {
  showInfo: boolean;
  selectableColumns: DropdownItemProps[];
}

export class FilterQueryBuilder extends React.Component<FilterQueryBuilderProps, FilterQueryBuilderState> {
  static defaultProps: Partial<FilterQueryBuilderProps> = { editable: true };
  state: FilterQueryBuilderState = { showInfo: false, selectableColumns: [] };
  private operations = [
    { key: 'lt', text: 'is Less Than', value: 'lt' },
    { key: 'le', text: 'is Less Than Or Equal', value: 'le' },
    { key: 'eq', text: 'is Equal', value: 'eq' },
    { key: 'ne', text: 'is Not Equal', value: 'ne' },
    { key: 'gt', text: 'is Greater Than', value: 'gt' },
    { key: 'ge', text: 'is Greater Than Or Equal', value: 'ge' },
    { key: 'text_search', text: 'Contains', value: 'text_search' }
  ];

  render() {
    return (
      <div>
        { this.renderFilters(this.props.filters) }
        <Button variant="danger" size="sm" onClick={ this.addFilter } hidden={ !this.props.editable }>
          <i className="material-icons mr-1">add</i>
          Add Filter
        </Button>
        <Button variant="secondary" size="sm" onClick={ this.toggleInfo } hidden={ !this.props.editable }>
          <i className="material-icons">info</i>
        </Button>
        <Alert variant="info" hidden={ !this.state.showInfo }>
          <p>
            <b>Multiple filter options</b> on the same step translate as an OR operation
            (rows that match one of them are returned), while adding multiple filter steps on an
            operation translates as an AND (rows that match both are returned).
          </p>

          <p>The example below explains how the <b>contains</b> operation works:</p>
          <p>Consider a <b>contains</b> operation for donor country</p>
          <ul>
            <li><i className="text-danger">united kingdom</i> only returns case insensitive exact matches.</li>
            <li><i className="text-danger">%united%</i> returns substring case insensitive matches.</li>
            <li><i className="text-danger">united kingdom|uganda</i> for exact matches joined by OR.</li>
            <li><i className="text-danger">united kingdom&uganda</i> for exact matches joined by AND.</li>
          </ul>
        </Alert>
      </div>
    );
  }

  componentDidMount() {
    const columns = this.props.source.get('columns') as ColumnList;
    const selectableColumns = getStepSelectableColumns(this.props.step, this.props.steps, columns) as Set<string>;
    this.setState({
      selectableColumns: selectableColumns.count()
        ? QueryBuilderHandler.getSelectOptionsFromColumns(selectableColumns)
        : []
    });
  }

  private renderFilters(filters?: List<FilterMap>) {
    if (filters) {
      return filters.map((filter, index) =>
        <FilterItem
          editable={ this.props.editable }
          key={ index }
          columns={ this.state.selectableColumns.sort(sortObjectArrayByProperty('text').sort) }
          operations={ this.operations }
          filter={ filter }
          onUpdate={ (filtr: FilterMap) => this.onUpdateItem(filtr, index) }
          onDelete={ () => this.onDeleteItem(index) }
        />
      );
    }

    return null;
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

import { Set } from 'immutable';
import * as React from 'react';
import { Button, Form } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { setSelectableColumns } from '../../pages/QueryBuilder/actions';
import { queryBuilderReducerId } from '../../pages/QueryBuilder/reducers';
import { ReduxStore } from '../../store';
import { ColumnList, SourceMap } from '../../types/sources';
import { formatString, getSelectOptionsFromColumns } from '../../utils';

interface ComponentProps {
  source: SourceMap;
  columns?: string[];
  editable?: boolean;
  onUpdateColumns?: (options: string) => void;
}

interface ReduxState {
  selectableColumns: Set<string>;
}

interface ActionProps {
  actions: {
    setSelectableColumns: typeof setSelectableColumns;
  };
}
type SelectQueryBuilderProps = ComponentProps & ActionProps & ReduxState;

class SelectQueryBuilder extends React.Component<SelectQueryBuilderProps, { selectableColumns: DropdownItemProps[] }> {
  static defaultProps: Partial<SelectQueryBuilderProps> = { editable: true };
  state = { selectableColumns: [] };

  render() {
    return (
      <React.Fragment>
        <Form.Group>
          <Form.Label className="bmd-label-floating">Columns</Form.Label>
          <Dropdown
            placeholder="Select Columns"
            fluid
            multiple
            search
            selection
            options={ this.state.selectableColumns }
            value={ this.props.columns }
            onChange={ this.onChange }
            disabled={ !this.props.editable }
          />
        </Form.Group>
        <Form.Group>
          <Button variant="danger" size="sm" onClick={ this.onSelectAll } hidden={ !this.props.editable }>
            <i className="material-icons mr-1">check_box</i>
            Select All
          </Button>
          <Button variant="danger" size="sm" onClick={ this.onDeselectAll } hidden={ !this.props.editable }>
            <i className="material-icons mr-1">check_box_outline_blank</i>
            Deselect All
          </Button>
        </Form.Group>
      </React.Fragment>
    );
  }

  componentDidMount() {
    if (!this.props.selectableColumns.count()) {
      const columns = this.props.source.get('columns') as ColumnList;
      const selectableColumns = columns.map(column => column.get('name')).toArray() as string[];
      this.props.actions.setSelectableColumns(this.props.selectableColumns.union(selectableColumns));
      this.setState({ selectableColumns: getSelectOptionsFromColumns(columns) });
    } else {
      this.setState({ selectableColumns: this.getSelectOptionsFromColumns(this.props.selectableColumns) });
    }
  }

  private getSelectOptionsFromColumns(columns: Set<string>): DropdownItemProps[] {
    if (columns.count()) {
      return columns.toArray().map((column, key) => ({
        key,
        text: formatString(column),
        value: column
      }));
    }

    return [];
  }

  private onChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    this.props.actions.setSelectableColumns(Set(data.value as string[]));
    if (this.props.onUpdateColumns) {
      this.props.onUpdateColumns(JSON.stringify({ columns: data.value as string[] }));
    }
  }

  private onSelectAll = () => {
    if (this.props.onUpdateColumns) {
      const columns = this.props.source.get('columns') as ColumnList;
      const columnNames = columns.map(column => column.get('name')).toJS();
      this.props.actions.setSelectableColumns(Set(columnNames));
      this.props.onUpdateColumns(JSON.stringify({ columns: columnNames as string[] }));
    }
  }

  private onDeselectAll = () => {
    if (this.props.onUpdateColumns) {
      this.props.onUpdateColumns(JSON.stringify({ columns: [] }));
    }
    this.props.actions.setSelectableColumns(Set(this.state.selectableColumns));
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators({ setSelectableColumns }, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => ({
  selectableColumns: reduxStore.getIn([ `${queryBuilderReducerId}`, 'selectableColumns' ]) as Set<string>
});

const connector = connect(mapStateToProps, mapDispatchToProps)(SelectQueryBuilder);

export { connector as default, connector as SelectQueryBuilder };

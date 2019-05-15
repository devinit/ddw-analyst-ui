import { List, Set } from 'immutable';
import * as React from 'react';
import { Button, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { queryBuilderReducerId } from '../../pages/QueryBuilder/reducers';
import { ReduxStore } from '../../store';
import { OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { formatString, getSelectOptionsFromColumns, getStepSelectableColumns } from '../../utils';

interface ComponentProps {
  source: SourceMap;
  columns?: string[];
  editable?: boolean;
  step: OperationStepMap;
  onUpdateColumns?: (options: string) => void;
}

interface ReduxState {
  steps: List<OperationStepMap>;
}

type SelectQueryBuilderProps = ComponentProps & ReduxState;

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
    const columns = this.props.source.get('columns') as ColumnList;
    const selectableColumns = getStepSelectableColumns(this.props.step, this.props.steps);
    this.setState({
      selectableColumns: selectableColumns.count()
        ? this.getSelectOptionsFromColumns(selectableColumns)
        : getSelectOptionsFromColumns(columns)
    });
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
    if (this.props.onUpdateColumns) {
      this.props.onUpdateColumns(JSON.stringify({ columns: data.value as string[] }));
    }
  }

  private onSelectAll = () => {
    if (this.props.onUpdateColumns) {
      const columns = this.props.source.get('columns') as ColumnList;
      const columnNames = columns.map(column => column.get('name')).toJS();
      this.props.onUpdateColumns(JSON.stringify({ columns: columnNames as string[] }));
    }
  }

  private onDeselectAll = () => {
    if (this.props.onUpdateColumns) {
      this.props.onUpdateColumns(JSON.stringify({ columns: [] }));
    }
  }
}

const mapStateToProps = (reduxStore: ReduxStore): ReduxState => ({
  steps: reduxStore.getIn([ `${queryBuilderReducerId}`, 'steps' ]) as List<OperationStepMap>
});

const connector = connect(mapStateToProps)(SelectQueryBuilder);

export { connector as default, connector as SelectQueryBuilder };

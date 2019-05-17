import { List, Set } from 'immutable';
import * as React from 'react';
import { Button, Form } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns } from '../../utils';
import { QueryBuilderHandlerStatic as QueryBuilderHandler } from '../QueryBuilderHandler';

interface SelectQueryBuilderProps {
  source: SourceMap;
  columns?: string[];
  editable?: boolean;
  step: OperationStepMap;
  steps: List<OperationStepMap>;
  onUpdateColumns?: (options: string) => void;
}

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
    const { source, step, steps } = this.props;
    const columns = source.get('columns') as ColumnList;
    const selectableColumns = getStepSelectableColumns(step, steps, columns) as Set<string>;
    this.setState({
      selectableColumns: selectableColumns.count()
        ? QueryBuilderHandler.getSelectOptionsFromColumns(selectableColumns)
        : []
    });
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

export { SelectQueryBuilder };

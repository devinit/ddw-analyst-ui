import * as React from 'react';
import { Button, Form } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { ColumnList, SourceMap } from '../../types/sources';
import { formatString } from '../../utils';

interface SelectQueryBuilderProps {
  source: SourceMap;
  columns?: string[];
  onUpdateColumns?: (options: string) => void;
}

export class SelectQueryBuilder extends React.Component<SelectQueryBuilderProps> {
  render() {
    const columns = this.props.source.get('columns') as ColumnList;

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
            options={ this.getSelectOptionsFromColumns(columns) }
            value={ this.props.columns }
            onChange={ this.onChange }
          />
        </Form.Group>
        <Form.Group>
          <Button variant="danger" size="sm" onClick={ this.onSelectAll }>
            <i className="material-icons mr-1">check_box</i>
            Select All
          </Button>
          <Button variant="danger" size="sm" onClick={ this.onDeselectAll }>
            <i className="material-icons mr-1">check_box_outline_blank</i>
            Deselect All
          </Button>
        </Form.Group>
      </React.Fragment>
    );
  }

  private getSelectOptionsFromColumns(columns: ColumnList): DropdownItemProps[] {
    if (columns.count()) {
      return columns.map(column => ({
        key: column.get('id'),
        text: formatString(column.get('name') as string),
        value: column.get('name')
      })).toJS();
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

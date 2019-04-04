import * as React from 'react';
import { ColumnList, SourceMap } from '../../types/sources';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { Form } from 'react-bootstrap';

interface SelectQueryBuilderProps {
  source: SourceMap;
  columns?: string[];
  onUpdateColumns?: (options: string) => void;
}

export class SelectQueryBuilder extends React.Component<SelectQueryBuilderProps> {
  render() {
    const columns = this.props.source.get('columns') as ColumnList;

    return (
      <Form.Group>
        <Form.Label className="bmd-label-floating">Columns</Form.Label>
        <Dropdown
          placeholder="Select Columns"
          fluid
          multiple
          search
          selection
          options={ this.getSelectOptionsFromColumns(columns) }
          defaultValue={ this.props.columns }
          onChange={ this.onChange }
        />
      </Form.Group>
    );
  }

  private getSelectOptionsFromColumns(columns: ColumnList): DropdownItemProps[] {
    if (columns.count()) {
      return columns.map(column => ({
        key: column.get('id'),
        text: column.get('source_name'),
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
}

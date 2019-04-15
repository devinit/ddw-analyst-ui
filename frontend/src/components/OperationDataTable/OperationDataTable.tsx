import { List } from 'immutable';
import * as React from 'react';
import { Table } from 'react-bootstrap';
import { OperationDataMap } from '../../types/operations';
import { ColumnList } from '../../types/sources';
import { formatString } from '../../utils';

interface OperationDataTableProps {
  list?: List<OperationDataMap>;
  columns?: ColumnList;
}

export class OperationDataTable extends React.Component<OperationDataTableProps> {
  private MAX_COLUMNS = 6;
  private columns = this.props.list ? this.getColumns(this.props.list.get(0)) : [];

  render() {
    if (this.props.list && this.props.list.count() && this.props.columns) {
      const customColumns = this.getCustomColumns(this.props.list.get(0) as OperationDataMap, this.props.columns);
      const columns = [ ...this.columns.slice(0, this.columns.length - customColumns.length), ...customColumns ];

      return (
        <Table responsive hover striped className="operation-data-table">
          <thead>
            <tr>
              { columns.map(column => <th key={ column } className="text-truncate">{ formatString(column) }</th>) }
            </tr>
          </thead>
          <tbody>{ this.renderTableRows(this.props.list, columns) }</tbody>
        </Table>
      );
    }

    return <div>No results found</div>;
  }

  private getColumns(item?: OperationDataMap): string[] {
    if (item) {
      const columns: string[] = [];
      let count = 0;
      item.mapKeys((key: string, value) => {
        if (value && count < this.MAX_COLUMNS) {
          columns.push(key);
          count++;
        }
      });

      return columns;
    }

    return [];
  }

  private renderTableRows(data: List<OperationDataMap>, columns: (string | number)[]) {
    if (data && columns.length) {
      return data.map((item, key) =>
        <tr key={ key }>
          { columns.map(column => <td key={ column }>{ item.get(column) }</td>) }
        </tr>
      );
    }
  }

  private getCustomColumns(item: OperationDataMap, columns: ColumnList): string[] {
    const columnKeys = columns.map(column => column.get('name')).toJS() as string[];
    const keysToIgnore = [ 'id', 'row_no' ];
    const customKeys: string[] = [];
    const iterator = item.keys();
    let key = iterator.next();
    while (!key.done) {
      const { value } = key;
      if (columnKeys.indexOf(value as string) === -1 && keysToIgnore.indexOf(value as string) === -1) {
        customKeys.push(value as string);
      }
      key = iterator.next();
    }

    return customKeys;
  }
}

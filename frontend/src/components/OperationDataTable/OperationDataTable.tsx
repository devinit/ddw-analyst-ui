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
      const columnMapping = this.getColumnMapping(this.props.columns, this.columns);

      return (
        <Table responsive hover striped className="operation-data-table">
          <thead>
            <tr>
              { columnMapping.map(column => <th key={ column } className="text-truncate">{ column }</th>) }
            </tr>
          </thead>
          <tbody>{ this.renderTableRows(this.props.list, this.columns) }</tbody>
        </Table>
      );
    }

    return <div>No results found</div>;
  }

  private getColumns(item?: OperationDataMap): (string | number)[] {
    if (item) {
      const columns: (string | number)[] = [];
      let count = 0;
      item.mapKeys((key, value) => {
        if (value && count < this.MAX_COLUMNS) {
          columns.push(key);
          count++;
        }
      });

      return columns;
    }

    return [];
  }

  private getColumnMapping(columnList: ColumnList, columnKeys: (string | number)[]) {
    return columnKeys.map(key => {
      const column = columnList.find(col => col.get('name') === key);
      if (column) {
        return formatString(column.get('name') as string);
      }

      return key;
    });
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
}

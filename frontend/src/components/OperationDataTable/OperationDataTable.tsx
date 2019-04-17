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
  private columns = this.props.list ? this.getColumns(this.props.list.get(0)) : [];

  render() {
    if (this.props.list && this.props.list.count() && this.props.columns) {
      return (
        <Table bordered responsive hover striped className="operation-data-table">
          <thead>
            <tr>
              { this.columns.map(column => <th key={ column } className="text-truncate">{ formatString(column) }</th>) }
            </tr>
          </thead>
          <tbody>{ this.renderTableRows(this.props.list, this.columns) }</tbody>
        </Table>
      );
    }

    return <div>No results found</div>;
  }

  private getColumns(item?: OperationDataMap): string[] {
    if (item) {
      const columns: string[] = [];
      item.mapKeys((key: string) => columns.push(key));

      return columns;
    }

    return [];
  }

  private renderTableRows(data: List<OperationDataMap>, columns: (string | number)[]) {
    if (data && columns.length) {
      return data.map((item, key) =>
        <tr key={ key }>
          { columns.map(column => <td key={ column } className="text-truncate">{ item.get(column) }</td>) }
        </tr>
      );
    }
  }
}

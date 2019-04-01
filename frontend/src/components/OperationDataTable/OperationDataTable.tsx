import { List } from 'immutable';
import * as React from 'react';
import { Table } from 'react-bootstrap';
import { OperationDataMap } from '../../types/operations';

interface OperationDataTableProps {
  data?: List<OperationDataMap>;
}

export class OperationDataTable extends React.Component<OperationDataTableProps> {
  private MAX_COLUMNS = 6;

  render() {
    if (this.props.data) {
      const columns = this.getColumns(this.props.data.get(0));

      return (
        <Table responsive hover striped className="operation-data-table">
          <thead>
            <tr>
              { columns.map(column => <th key={ column }>{ column }</th>) }
            </tr>
          </thead>
          <tbody>{ this.renderTableRows(this.props.data, columns) }</tbody>
        </Table>
      );
    }

    return null;
  }

  private getColumns(item?: OperationDataMap) {
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

  private renderTableRows(data: List<OperationDataMap>, columns: (string | number)[]) {
    if (data && columns.length) {
      return data.map((item, key) =>
        <tr key={ key }>
          { columns.map(column => <td key={ column } className="col-2 text-truncate">{ item.get(column) }</td>) }
        </tr>
      );
    }
  }
}

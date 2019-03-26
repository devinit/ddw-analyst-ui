import { List } from 'immutable';
import * as React from 'react';
import { Card, FormControl } from 'react-bootstrap';
import { OperationMap } from '../../types/operations';
import { debounce } from 'lodash';
import { OperationsTable } from '../OperationsTable/OperationsTable';

interface OperationsTableCardProps {
  operations: List<OperationMap>;
  onRowClick: (operation: OperationMap) => void;
}

interface OperationsTableCardState {
  operations: List<OperationMap>;
  searchQuery: string;
}

export class OperationsTableCard extends React.Component<OperationsTableCardProps, OperationsTableCardState> {
  state: OperationsTableCardState = {
    operations: this.props.operations,
    searchQuery: ''
  };

  static querySources(operations: List<OperationMap>, searchQuery: string) {
    return operations.filter(operation => {
      const name = (operation.get('name') as string).toLowerCase().indexOf(searchQuery) > -1;

      return name;
    });
  }

  static getDerivedStateFromProps(props: OperationsTableCardProps, state: OperationsTableCardState): OperationsTableCardState | null { //tslint:disable-line
    if (state.searchQuery) {
      const operations = OperationsTableCard.querySources(props.operations, state.searchQuery);
      if (operations.count()) {
        props.onRowClick(operations.get(0) as OperationMap);
      }

      return {
        operations,
        searchQuery: state.searchQuery
      };
    } else {
      const count = props.operations.count();
      if (count !== state.operations.count()) {
        props.onRowClick(props.operations.get(0) as OperationMap);

        return {
          operations: props.operations,
          searchQuery: state.searchQuery
        };
      }
    }

    return null;
  }

  render() {
    return (
      <Card>
        <Card.Header className="card-header-text card-header-danger">
          <Card.Text>Queries</Card.Text>
          <FormControl
            placeholder="Search ..."
            className="w-50"
            onChange={ debounce(this.onSearchChange, 1000, { leading: true }) }
            data-testid="sources-table-search"
          />
        </Card.Header>
        <Card.Body>
          <OperationsTable operations={ this.state.operations } onRowClick={ this.props.onRowClick }/>
        </Card.Body>
      </Card>
    );
  }

  private onSearchChange = (event: React.FormEvent<any>) => {
    const { value } = event.currentTarget as HTMLInputElement;
    this.setState({ searchQuery: value || '' });
  }
}

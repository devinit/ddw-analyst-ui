import { List } from 'immutable';
import { debounce } from 'lodash';
import * as React from 'react';
import { Button, Card, Col, FormControl, OverlayTrigger, Pagination, Popover, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import * as operationsActions from '../../actions/operations';
import { OperationsState } from '../../reducers/operations';
import { ReduxStore } from '../../store';
import { LinksMap } from '../../types/api';
import { OperationMap } from '../../types/operations';
import { OperationsTable } from '../OperationsTable/OperationsTable';

interface ActionProps {
  actions: typeof operationsActions;
}
interface ReduxState {
  operations: OperationsState;
}
interface ComponentProps extends RouteComponentProps {
  limit: number;
  offset: number;
  links?: LinksMap;
}
type OperationsTableCardProps = ComponentProps & ActionProps & ReduxState;

class OperationsTableCard extends React.Component<OperationsTableCardProps> {
  static defaultProps: Partial<OperationsTableCardProps> = {
    offset: 0
  };

  render() {
    const operations = this.props.operations.get('operations') as List<OperationMap>;
    const loading = this.props.operations.get('loading') as boolean;

    return (
      <React.Fragment>
        <Dimmer active={ loading } inverted>
          <Loader content="Loading" />
        </Dimmer>
        <Card>
          <Card.Header className="card-header-text card-header-danger">
            <Card.Text>Queries</Card.Text>
            <FormControl
              placeholder="Search ..."
              className="w-25"
              onChange={ debounce(this.onSearchChange, 1000, { leading: true }) }
              data-testid="sources-table-search"
            />
          </Card.Header>
          <Card.Body>
            <OperationsTable>
              { this.renderRows(operations) }
            </OperationsTable>
            { this.renderPagination() }
          </Card.Body>
        </Card>
      </React.Fragment>
    );
  }

  componentDidMount() {
    const operations = this.props.operations.get('operations') as List<OperationMap>;
    const loading = this.props.operations.get('loading') as boolean;
    if (!operations.count() && !loading) {
      this.props.actions.fetchOperations({ limit: 10, offset: 0 });
    }
  }

  private renderRows(operations: List<OperationMap>) {
    if (operations && operations.size) {
      return operations.map((operation, index) => (
        <OperationsTable.Row
          key={ index }
          count={ index + 1 }
          onClick={ () => this.onRowClick(operation) }
          name={ operation.get('name') as string }
          updatedOn={ operation.get('updated_on') as string }
        >
          <OperationsTable.Actions>
            <OverlayTrigger placement="top" overlay={ <Popover id="view">View Operation Data</Popover> }>
              <Button variant="danger" size="sm" className="btn-link" onClick={ this.viewData(operation) }>
                <i className="material-icons">view_list</i>
              </Button>
            </OverlayTrigger>
            <Button variant="danger" size="sm" className="btn-link">
              <i className="material-icons">edit</i>
            </Button>
            <Button variant="danger" size="sm" className="btn-link">
              <i className="material-icons">close</i>
            </Button>
          </OperationsTable.Actions>
        </OperationsTable.Row>
      ));
    }

    return null;
  }

  private renderPagination() {
    const count = this.props.operations.get('count') as number;
    const { offset, limit } = this.props;
    const max = offset + limit;

    return (
      <Row>
        <Col md={ 6 }>
          Showing { offset + 1 } to { max > count ? count : max } of { count }
        </Col>
        <Col md={ 6 }>
          <Pagination className="float-right">
            <Pagination.First onClick={ this.goToFirst } data-testid="operations-pagination-first">
              <i className="material-icons">first_page</i>
            </Pagination.First>
            <Pagination.Prev onClick={ this.goToPrev } data-testid="operations-pagination-prev">
              <i className="material-icons">chevron_left</i>
            </Pagination.Prev>
            <Pagination.Next onClick={ this.goToNext } data-testid="operations-pagination-next">
              <i className="material-icons">chevron_right</i>
            </Pagination.Next>
            <Pagination.Last onClick={ this.goToLast } data-testid="operations-pagination-last">
              <i className="material-icons">last_page</i>
            </Pagination.Last>
          </Pagination>
        </Col>
      </Row>
    );
  }

  private onSearchChange = (event: React.FormEvent<any>) => {
    const { value } = event.currentTarget as HTMLInputElement;
    this.setState({ searchQuery: value || '' });
  }

  private onRowClick = (_operation: OperationMap) => {
    //
  }

  private goToFirst = () => {
    this.props.actions.fetchOperations({ limit: this.props.limit, offset: 0 });
  }

  private goToLast = () => {
    const count = this.props.operations.get('count') as number;
    const pages = Math.ceil(count / this.props.limit);
    const offset = (pages - 1) * this.props.limit;
    this.props.actions.fetchOperations({ limit: this.props.limit, offset });
  }

  private goToNext = () => {
    const count = this.props.operations.get('count') as number;
    const offset = this.props.offset + this.props.limit;
    if (offset < count) {
      this.props.actions.fetchOperations({ limit: this.props.limit, offset });
    }
  }

  private goToPrev = () => {
    if (this.props.offset > 0) {
      const offset = this.props.offset - this.props.limit;
      this.props.actions.fetchOperations({ limit: this.props.limit, offset });
    }
  }

  private viewData = (operation: OperationMap) => () => {
    const id = operation.get('id');
    this.props.history.push(`/queries/data/${id}`);
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, ComponentProps> = (dispatch): ActionProps => ({
  actions: bindActionCreators(operationsActions, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    operations: reduxStore.get('operations') as OperationsState
  };
};

const connector = withRouter<ComponentProps>(connect(mapStateToProps, mapDispatchToProps)(OperationsTableCard));

export { connector as OperationsTableCard, connector as default };

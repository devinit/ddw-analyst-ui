import { List } from 'immutable';
import { debounce } from 'lodash';
import * as React from 'react';
import { Button, Card, Col, FormControl, Nav, OverlayTrigger, Pagination, Popover, Row, Tab } from 'react-bootstrap';
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
        <Tab.Container defaultActiveKey="myQueries">
          <Card>
            <Card.Header className="card-header-text card-header-danger">
              <FormControl
                placeholder="Search ..."
                className="w-25 d-none"
                onChange={ debounce(this.onSearchChange, 1000, { leading: true }) }
                data-testid="sources-table-search"
              />
            </Card.Header>
            <Card.Body>
              <Nav variant="pills" className="nav-pills-danger" role="tablist">
                <Nav.Item onClick={ () => this.fetchQueries(true) }>
                  <Nav.Link eventKey="myQueries">My Queries</Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={ () => this.fetchQueries() }>
                  <Nav.Link eventKey="otherQueries">Other Queries</Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content>
                <Tab.Pane eventKey="myQueries">
                  <OperationsTable>
                    { this.renderRows(operations, true) }
                  </OperationsTable>
                  { this.renderPagination() }
                </Tab.Pane>
                <Tab.Pane eventKey="otherQueries">
                  <OperationsTable>
                    { this.renderRows(operations) }
                  </OperationsTable>
                  { this.renderPagination() }
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.fetchQueries(true);
  }

  private renderRows(operations: List<OperationMap>, allowEdit = false) {
    const EditAction = ({ operation }: { operation: OperationMap }) => (
        <Button variant="danger" size="sm" className="btn-link" onClick={ this.onEditOperation(operation) }>
          Edit
        </Button>
    );

    if (operations && operations.count()) {
      return operations.map((operation, index) => (
        <OperationsTable.Row
          key={ index }
          count={ index + 1 }
          name={ operation.get('name') as string }
          updatedOn={ operation.get('updated_on') as string }
          isDraft={ operation.get('is_draft') as boolean }
          onClick={ this.onEditOperation(operation) }
        >
          <OperationsTable.Actions>
            <OverlayTrigger placement="top" overlay={ <Popover id="view">View Operation Data</Popover> }>
              <Button variant="danger" size="sm" className="btn-link" onClick={ this.viewData(operation) }>
                View Data
              </Button>
            </OverlayTrigger>
            { allowEdit ? <EditAction operation={ operation } /> : null }
          </OperationsTable.Actions>
        </OperationsTable.Row>
      ));
    }

    return <div>No results found</div>;
  }

  private renderPagination() {
    const count = this.props.operations.get('count') as number;
    const { offset, limit } = this.props;
    const max = offset + limit;

    if (!count) {
      return null;
    }

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

  private fetchQueries(mine = false) {
    const loading = this.props.operations.get('loading') as boolean;
    if (!loading) {
      this.props.actions.fetchOperations({ limit: this.props.limit, offset: 0, mine });
    }
  }

  private onSearchChange = (event: React.FormEvent<any>) => {
    const { value } = event.currentTarget as HTMLInputElement;
    this.setState({ searchQuery: value || '' });
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

  private viewData = (operation: OperationMap) => (event: React.MouseEvent<any, MouseEvent>) => {
    event.stopPropagation();
    const id = operation.get('id');
    this.props.actions.setOperation(operation);
    this.props.history.push(`/queries/data/${id}`);
  }

  private onEditOperation = (operation: OperationMap) => (event: React.MouseEvent<any, MouseEvent>) => {
    event.stopPropagation();
    this.props.history.push(`/queries/build/${operation.get('id') as number}/`);
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

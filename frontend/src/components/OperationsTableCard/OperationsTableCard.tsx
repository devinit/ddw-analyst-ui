import { List } from 'immutable';
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
interface OperationsTableCardState {
  showingMyQueries: boolean;
  searchQuery: string;
}

class OperationsTableCard extends React.Component<OperationsTableCardProps, OperationsTableCardState> {
  static defaultProps: Partial<OperationsTableCardProps> = {
    offset: 0
  };
  state = { showingMyQueries: true, searchQuery: '' };

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
                  <FormControl
                    placeholder="Search ..."
                    className="w-25"
                    value={ this.state.searchQuery }
                    onChange={ this.onSearchChange }
                    onKeyDown={ this.onSearch }
                    data-testid="sources-table-search"
                  />
                  { this.renderOperationsTable(operations, true) }
                  { this.renderPagination() }
                </Tab.Pane>
                <Tab.Pane eventKey="otherQueries">
                  <FormControl
                    placeholder="Search ..."
                    className="w-25"
                    value={ this.state.searchQuery }
                    onChange={ this.onSearchChange }
                    onKeyDown={ this.onSearch }
                    data-testid="sources-table-search"
                  />
                  { this.renderOperationsTable(operations) }
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

  private renderOperationsTable(operations: List<OperationMap>, allowEdit = false) {
    const EditAction = ({ operation }: { operation: OperationMap }) => (
        <Button variant="danger" size="sm" className="btn-link" onClick={ this.onEditOperation(operation) }>
          Edit
        </Button>
    );

    if (operations && operations.count()) {
      return (
        <OperationsTable>
          {
            operations.map((operation, index) => (
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
            ))
          }
        </OperationsTable>
      );
    }

    return <div className="mt-3">No results found</div>;
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
    if (mine && !this.state.showingMyQueries) {
      this.setState({ showingMyQueries: true, searchQuery: '' });
    }
    if (!mine && this.state.showingMyQueries) {
      this.setState({ showingMyQueries: false, searchQuery: '' });
    }
  }

  private onSearchChange = (event: React.FormEvent<any>) => {
    const { value: searchQuery = '' } = event.currentTarget as HTMLInputElement;
    this.setState({ searchQuery });
  }

  private onSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      const { value } = event.currentTarget as HTMLInputElement;
      this.setState({ searchQuery: value || '' });
      this.props.actions.fetchOperations({
        limit: this.props.limit,
        offset: 0, search: value || '',
        mine: this.state.showingMyQueries
      });
    }
  }

  private goToFirst = () => {
    this.props.actions.fetchOperations({
      limit: this.props.limit,
      offset: 0,
      search: this.state.searchQuery,
      mine: this.state.showingMyQueries
    });
  }

  private goToLast = () => {
    const count = this.props.operations.get('count') as number;
    const pages = Math.ceil(count / this.props.limit);
    const offset = (pages - 1) * this.props.limit;
    this.props.actions.fetchOperations({
      limit: this.props.limit,
      offset,
      search: this.state.searchQuery,
      mine: this.state.showingMyQueries
    });
  }

  private goToNext = () => {
    const count = this.props.operations.get('count') as number;
    const offset = this.props.offset + this.props.limit;
    if (offset < count) {
      this.props.actions.fetchOperations({
        limit: this.props.limit,
        offset,
        search: this.state.searchQuery,
        mine: this.state.showingMyQueries
      });
    }
  }

  private goToPrev = () => {
    if (this.props.offset > 0) {
      const offset = this.props.offset - this.props.limit;
      this.props.actions.fetchOperations({
        limit: this.props.limit,
        offset,
        search: this.state.searchQuery,
        mine: this.state.showingMyQueries
      });
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

const connector = withRouter<ComponentProps, any>(connect(mapStateToProps, mapDispatchToProps)(OperationsTableCard));

export { connector as OperationsTableCard, connector as default };

import { List } from 'immutable';
import React, { FunctionComponent, useState, useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  FormControl,
  Nav,
  OverlayTrigger,
  Pagination,
  Popover,
  Row,
  Tab,
} from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import * as operationsActions from '../../actions/operations';
import { OperationsState } from '../../reducers/operations';
import { ReduxStore } from '../../store';
import { LinksMap } from '../../types/api';
import { OperationMap } from '../../types/operations';
import { OperationsTable } from '../OperationsTable';

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

const OperationsTableCard: FunctionComponent<OperationsTableCardProps> = (props) => {
  const [showingMyQueries, setShowingMyQueries] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchQueries(true);
  }, []);

  const fetchQueries = (mine = false) => {
    const loading = props.operations.get('loading') as boolean;
    if (!loading) {
      props.actions.fetchOperations({ limit: props.limit, offset: 0, mine });
    }
    if (mine && !showingMyQueries) {
      setShowingMyQueries(true);
      setSearchQuery('');
    }
    if (!mine && showingMyQueries) {
      setShowingMyQueries(false);
      setSearchQuery('');
    }
  };

  const onSearchChange = (event: React.FormEvent<any>) => {
    const { value: searchQuery = '' } = event.currentTarget as HTMLInputElement;
    setSearchQuery(searchQuery);
  };

  const onSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      const { value } = event.currentTarget as HTMLInputElement;
      setSearchQuery(value || '');
      props.actions.fetchOperations({
        limit: props.limit,
        offset: 0,
        search: value || '',
        mine: showingMyQueries,
      });
    }
  };

  const goToFirst = () => {
    props.actions.fetchOperations({
      limit: props.limit,
      offset: 0,
      search: searchQuery,
      mine: showingMyQueries,
    });
  };

  const goToLast = () => {
    const count = props.operations.get('count') as number;
    const pages = Math.ceil(count / props.limit);
    const offset = (pages - 1) * props.limit;
    props.actions.fetchOperations({
      limit: props.limit,
      offset,
      search: searchQuery,
      mine: showingMyQueries,
    });
  };

  const goToNext = () => {
    const count = props.operations.get('count') as number;
    const offset = props.offset + props.limit;
    if (offset < count) {
      props.actions.fetchOperations({
        limit: props.limit,
        offset,
        search: searchQuery,
        mine: showingMyQueries,
      });
    }
  };

  const goToPrev = () => {
    if (props.offset > 0) {
      const offset = props.offset - props.limit;
      props.actions.fetchOperations({
        limit: props.limit,
        offset,
        search: searchQuery,
        mine: showingMyQueries,
      });
    }
  };

  const viewData = (operation: OperationMap) => (event: React.MouseEvent<any, MouseEvent>) => {
    event.stopPropagation();
    const id = operation.get('id');
    props.actions.setOperation(operation);
    props.history.push(`/queries/data/${id}`);
  };

  const onEditOperation = (operation: OperationMap) => (
    event: React.MouseEvent<any, MouseEvent>,
  ) => {
    event.stopPropagation();
    props.history.push(`/queries/build/${operation.get('id') as number}/`);
  };

  const operations = props.operations.get('operations') as List<OperationMap>;
  const loading = props.operations.get('loading') as boolean;

  const renderOperationsTable = (operations: List<OperationMap>, allowEdit = false) => {
    const EditAction = ({ operation }: { operation: OperationMap }) => (
      <Button variant="danger" size="sm" className="btn-link" onClick={onEditOperation(operation)}>
        Edit
      </Button>
    );

    if (operations && operations.count()) {
      return (
        <OperationsTable>
          {operations.map((operation, index) => (
            <OperationsTable.Row
              key={index}
              count={index + 1}
              name={operation.get('name') as string}
              updatedOn={operation.get('updated_on') as string}
              isDraft={operation.get('is_draft') as boolean}
              onClick={onEditOperation(operation)}
            >
              <OperationsTable.Actions>
                <OverlayTrigger
                  placement="top"
                  overlay={<Popover id="view">View Operation Data</Popover>}
                >
                  <Button
                    variant="danger"
                    size="sm"
                    className="btn-link"
                    onClick={viewData(operation)}
                  >
                    View Data
                  </Button>
                </OverlayTrigger>
                {allowEdit ? <EditAction operation={operation} /> : null}
              </OperationsTable.Actions>
            </OperationsTable.Row>
          ))}
        </OperationsTable>
      );
    }

    return <div className="mt-3">No results found</div>;
  };

  const renderPagination = () => {
    const count = props.operations.get('count') as number;
    const { offset, limit } = props;
    const max = offset + limit;

    if (!count) {
      return null;
    }

    return (
      <Row>
        <Col md={6}>
          Showing {offset + 1} to {max > count ? count : max} of {count}
        </Col>
        <Col md={6}>
          <Pagination className="float-right">
            <Pagination.First onClick={goToFirst} data-testid="operations-pagination-first">
              <i className="material-icons">first_page</i>
            </Pagination.First>
            <Pagination.Prev onClick={goToPrev} data-testid="operations-pagination-prev">
              <i className="material-icons">chevron_left</i>
            </Pagination.Prev>
            <Pagination.Next onClick={goToNext} data-testid="operations-pagination-next">
              <i className="material-icons">chevron_right</i>
            </Pagination.Next>
            <Pagination.Last onClick={goToLast} data-testid="operations-pagination-last">
              <i className="material-icons">last_page</i>
            </Pagination.Last>
          </Pagination>
        </Col>
      </Row>
    );
  };

  return (
    <React.Fragment>
      <Dimmer active={loading} inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Tab.Container defaultActiveKey="myQueries">
        <Card>
          <Card.Body>
            <Nav variant="pills" className="nav-pills-danger" role="tablist">
              <Nav.Item onClick={() => fetchQueries(true)}>
                <Nav.Link eventKey="myQueries">My Datasets</Nav.Link>
              </Nav.Item>
              <Nav.Item onClick={() => fetchQueries()}>
                <Nav.Link eventKey="otherQueries">Other Datasets</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="myQueries">
                <FormControl
                  placeholder="Search ..."
                  className="w-25"
                  value={searchQuery}
                  onChange={onSearchChange}
                  onKeyDown={onSearch}
                  data-testid="sources-table-search"
                />
                {renderOperationsTable(operations, true)}
                {renderPagination()}
              </Tab.Pane>
              <Tab.Pane eventKey="otherQueries">
                <FormControl
                  placeholder="Search ..."
                  className="w-25"
                  value={searchQuery}
                  onChange={onSearchChange}
                  onKeyDown={onSearch}
                  data-testid="sources-table-search"
                />
                {renderOperationsTable(operations)}
                {renderPagination()}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </React.Fragment>
  );
};

OperationsTableCard.defaultProps = { offset: 0 };

const mapDispatchToProps: MapDispatchToProps<ActionProps, ComponentProps> = (
  dispatch,
): ActionProps => ({
  actions: bindActionCreators(operationsActions, dispatch),
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    operations: reduxStore.get('operations') as OperationsState,
  };
};

const connector = withRouter<ComponentProps, any>(
  connect(mapStateToProps, mapDispatchToProps)(OperationsTableCard),
);

export { connector as OperationsTableCard, connector as default };

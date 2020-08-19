import { List } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Card, FormControl, Nav, OverlayTrigger, Popover, Tab } from 'react-bootstrap';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import * as operationsActions from '../../actions/operations';
import { OperationsState } from '../../reducers/operations';
import { ReduxStore } from '../../store';
import { LinksMap } from '../../types/api';
import { FormControlElement } from '../../types/bootstrap';
import { OperationMap } from '../../types/operations';
import { api } from '../../utils';
import { OperationsTable } from '../OperationsTable';
import { OperationsTableRow } from '../OperationsTableRow';
import OperationsTableRowActions from '../OperationsTableRowActions';
import { PaginationRow } from '../PaginationRow';

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
  sourceID?: number;
}
type OperationsTableCardProps = ComponentProps & ActionProps & ReduxState;

const getSourceDatasetsLink = (
  sourceID: number,
  mine = false,
  limit = 10,
  offset = 0,
  search = '',
): string =>
  `${
    mine ? api.routes.FETCH_MY_SOURCE_DATASETS : api.routes.FETCH_SOURCE_DATASETS
  }${sourceID}?limit=${limit}&offset=${offset}&search=${search}`;

const OperationsTableCard: FunctionComponent<OperationsTableCardProps> = (props) => {
  const [showMyQueries, setShowMyQueries] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchQueries(showMyQueries);
  }, []);

  const fetchQueries = (mine = false) => {
    const loading = props.operations.get('loading') as boolean;
    if (!loading) {
      props.actions.fetchOperations({
        limit: props.limit,
        offset: 0,
        mine,
        link: props.sourceID ? getSourceDatasetsLink(props.sourceID, mine, props.limit) : undefined,
      });
    }
    if (mine && !showMyQueries) {
      setShowMyQueries(true);
      setSearchQuery('');
    }
    if (!mine && showMyQueries) {
      setShowMyQueries(false);
      setSearchQuery('');
    }
  };

  const onSearchChange = (event: React.ChangeEvent<FormControlElement>) => {
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
        mine: showMyQueries,
        link: props.sourceID
          ? getSourceDatasetsLink(props.sourceID, showMyQueries, props.limit, 0, value)
          : undefined,
      });
    }
  };

  const viewData = (operation: OperationMap) => (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    const id = operation.get('id');
    props.actions.setOperation(operation);
    props.history.push(`/queries/data/${id}`);
  };

  const onEditOperation = (operation: OperationMap) => (
    event: React.MouseEvent<HTMLButtonElement | HTMLTableRowElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    props.history.push(`/queries/build/${operation.get('id') as number}/`);
  };

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
            <OperationsTableRow
              key={index}
              count={index + 1}
              name={operation.get('name') as string}
              updatedOn={operation.get('updated_on') as string}
              isDraft={operation.get('is_draft') as boolean}
            >
              <OperationsTableRowActions>
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
              </OperationsTableRowActions>
            </OperationsTableRow>
          ))}
        </OperationsTable>
      );
    }

    return <div className="mt-3">No results found</div>;
  };

  const onPageChange = (page: { selected: number }): void => {
    props.actions.fetchOperations({
      limit: props.limit,
      offset: page.selected * props.limit,
      search: searchQuery,
      mine: showMyQueries,
      link: props.sourceID
        ? getSourceDatasetsLink(
            props.sourceID,
            showMyQueries,
            props.limit,
            page.selected * props.limit,
          )
        : undefined,
    });
  };

  const renderPagination = () => {
    const count = props.operations.get('count') as number;

    if (count) {
      return (
        <PaginationRow
          pageRangeDisplayed={2}
          limit={props.limit}
          count={count}
          pageCount={Math.ceil(count / props.limit)}
          onPageChange={onPageChange}
        />
      );
    }
  };

  const operations = props.operations.get('operations') as List<OperationMap>;
  const loading = props.operations.get('loading') as boolean;

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
                <Nav.Link eventKey="otherQueries">Published Datasets</Nav.Link>
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

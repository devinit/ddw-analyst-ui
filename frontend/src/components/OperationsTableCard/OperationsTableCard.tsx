import { List } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { FormControl, OverlayTrigger, Popover, Tab } from 'react-bootstrap';
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
import { DatasetCardBody } from '../DatasetCardBody';
import { DatasetCardFooter } from '../DatasetCardFooter';
import { DatasetContent } from '../DatasetContent';
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
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    const id = operation.get('id');
    props.actions.setOperation(operation);
    props.history.push(`/queries/data/${id}`);
  };

  const onEditOperation = (operation: OperationMap) => (
    event: React.MouseEvent<HTMLAnchorElement | HTMLTableRowElement, MouseEvent>,
  ) => {
    event.preventDefault();
    props.history.push(`/queries/build/${operation.get('id') as number}/`);
  };

  const renderOperationsTable = (operations: List<OperationMap>, allowEdit = false) => {
    const EditAction = ({ operation }: { operation: OperationMap }) => (
      <a
        className="btn btn-sm btn-dark"
        href={`/queries/build/${operation.get('id') as number}/`}
        onClick={onEditOperation(operation)}
      >
        Edit
      </a>
    );

    if (operations && operations.count()) {
      console.log(JSON.stringify(operations));

      return (
        <OperationsTable>
          <DatasetCardBody removePadding={false}>
            <FormControl
              placeholder="Search ..."
              className="w-25"
              value={searchQuery}
              onChange={onSearchChange}
              onKeyDown={onSearch}
              data-testid="sources-table-search"
            />
          </DatasetCardBody>
          {operations.map((operation, index) => (
            <OperationsTableRow
              key={index}
              count={index + 1}
              name={operation.get('name') as string}
              updatedOn={operation.get('updated_on') as string}
              isDraft={operation.get('is_draft') as boolean}
              description={operation.get('description') as string}
              user={operation.get('user') as string}
            >
              <OperationsTableRowActions>
                {allowEdit ? <EditAction operation={operation} /> : null}
                <OverlayTrigger
                  placement="top"
                  overlay={<Popover id="view">View Operation Data</Popover>}
                >
                  <a
                    className="btn btn-sm btn-dark"
                    href={`/queries/data/${operation.get('id')}`}
                    onClick={viewData(operation)}
                  >
                    View Data
                  </a>
                </OverlayTrigger>
                <button
                  className="btn btn-sm btn-dark"
                  data-toggle="modal"
                  data-target="#queryModal"
                >
                  SQL Query
                </button>
                <button className="btn btn-sm btn-dark">Export to CSV</button>
              </OperationsTableRowActions>
            </OperationsTableRow>
          ))}
          <DatasetCardFooter>{renderPagination()}</DatasetCardFooter>
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
        <DatasetContent>{renderOperationsTable(operations, true)}</DatasetContent>
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

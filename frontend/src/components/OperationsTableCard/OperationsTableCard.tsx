import { List } from 'immutable';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  FormControl,
  OverlayTrigger,
  Popover,
  Row,
} from 'react-bootstrap';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Dimmer, Dropdown, DropdownItemProps, DropdownProps, Loader } from 'semantic-ui-react';
import * as operationsActions from '../../actions/operations';
import { SourcesContext } from '../../context';
import { OperationsState } from '../../reducers/operations';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
import { LinksMap } from '../../types/api';
import { FormControlElement } from '../../types/bootstrap';
import { OperationMap } from '../../types/operations';
import { api } from '../../utils';
import { BasicModal } from '../BasicModal';
import { DatasetActionLink } from '../DatasetActionLink';
import { OperationsTableRow } from '../OperationsTableRow';
import OperationsTableRowActions from '../OperationsTableRowActions';
import { PaginationRow } from '../PaginationRow';

interface ActionProps {
  actions: typeof operationsActions;
}
interface ReduxState {
  operations: OperationsState;
  user: UserState;
}
interface ComponentProps extends RouteComponentProps {
  limit: number;
  offset: number;
  links?: LinksMap;
  sourceID?: number;
  showMyQueries?: boolean;
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
  const [showMyQueries, setShowMyQueries] = useState(props.showMyQueries);
  const [searchQuery, setSearchQuery] = useState('');
  const [info, setInfo] = useState('');
  const [dropDownValues, setDropDownValues] = useState<DropdownItemProps[]>([]);
  const onModalHide = () => setInfo('');
  const { sources } = useContext(SourcesContext);
  const [source, setSource] = useState(0);
  const currentUrlParams = new URLSearchParams(window.location.search);
  const page = currentUrlParams.get('page');
  const pageNumber = page ? parseInt(page) : 0;
  localStorage.setItem('offset', (pageNumber * props.limit).toString());

  useEffect(() => {
    fetchQueries(showMyQueries);
  }, [pageNumber]);

  useEffect(() => {
    const values = Array.from(sources, (source) => {
      return {
        text: `${source.get('indicator')}`,
        value: source.get('id'),
      };
    });
    setDropDownValues(values as DropdownItemProps[]);
  }, [sources]);

  const fetchQueries = (mine = false) => {
    const loading = props.operations.get('loading') as boolean;
    if (!loading) {
      props.actions.fetchOperations({
        limit: props.limit,
        offset: parseInt(localStorage.getItem('offset') || '{}'),
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
    props.history.push('/');
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

  const onViewData = (operation: OperationMap) => {
    props.actions.setOperation(operation);
    props.history.push(`/queries/data/${operation.get('id')}`);
  };

  const onViewHistory = (operation: OperationMap) => {
    props.actions.setOperation(operation);
    props.history.push(`/queries/history/${operation.get('id')}`);
  };

  const onViewSQLQuery = (operation: OperationMap) => (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    setInfo(operation.get('operation_query') as string);
  };

  const onEditOperation = (operation: OperationMap) => {
    props.history.push(`/queries/build/${operation.get('id') as number}/`);
  };

  const onDuplicateOperation = (operation: OperationMap) => {
    props.actions.setOperation(operation, true);
    props.history.push('/queries/build/');
  };

  const onDuplicate = (operation: OperationMap) => {
    if (operation) {
      const duplicateOperation = operation.withMutations((opn) =>
        opn.delete('id').set('name', `Copy of ${opn.get('name')}`),
      );
      onDuplicateOperation(duplicateOperation);
    }
  };

  const renderOperations = (operations: List<OperationMap>, allowEdit = false) => {
    if (operations && operations.count()) {
      return operations.map((operation, index) => {
        const showEdit = allowEdit || props.user.get('username') === operation.get('user');

        return (
          <OperationsTableRow key={index} operation={operation} showDraftBadge={showMyQueries}>
            <OperationsTableRowActions>
              <DatasetActionLink operation={operation} show={showEdit} onClick={onEditOperation}>
                Edit
              </DatasetActionLink>
              <OverlayTrigger
                placement="top"
                overlay={<Popover id="view">View Dataset Data</Popover>}
              >
                <DatasetActionLink operation={operation} action="data" onClick={onViewData}>
                  View Data
                </DatasetActionLink>
              </OverlayTrigger>
              <Button
                variant="dark"
                size="sm"
                data-testid="dataset-duplicate"
                onClick={() => onDuplicate(operation)}
              >
                Make a Copy
              </Button>
              <Button variant="dark" size="sm" onClick={onViewSQLQuery(operation)}>
                SQL Query
              </Button>
              <Form action={`${api.routes.EXPORT}${operation.get('id')}/`} method="POST">
                <Button type="submit" variant="dark" size="sm">
                  Export to CSV
                </Button>
              </Form>
              <DatasetActionLink operation={operation} action="history" onClick={onViewHistory}>
                Versions
              </DatasetActionLink>
            </OperationsTableRowActions>
          </OperationsTableRow>
        );
      });
    }

    return <div className="px-4 pb-3">No datasets found</div>;
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
    if (page.selected !== 0) {
      currentUrlParams.set('page', (page.selected + 1).toString());
      if (searchQuery) {
        currentUrlParams.set('q', searchQuery);
      }
      if (source) {
        currentUrlParams.set('source', source.toString());
      }
      props.history.push(`${window.location.pathname}?${currentUrlParams.toString()}`);
    } else {
      props.history.push('/');
    }
  };

  const onFilterByDataSource = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
    props.history.push('/');
    const { value } = data;
    setSource(value as number);
    props.actions.fetchOperations({
      limit: props.limit,
      offset: 0,
      search: searchQuery,
      mine: showMyQueries,
      link:
        (value as string) && getSourceDatasetsLink(value as number, showMyQueries, props.limit, 0),
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
          currentPage={pageNumber === 0 ? 0 : pageNumber - 1}
        />
      );
    }
  };

  const operations = props.operations.get('operations') as List<OperationMap>;
  const loading = props.operations.get('loading') as boolean;

  return (
    <>
      <Dimmer active={loading} inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Card className="dataset-list">
        <Card.Body>
          <Row>
            <Col xs="6" lg="4" md="6">
              <FormControl
                placeholder="Search ..."
                className="w-100"
                value={searchQuery}
                onChange={onSearchChange}
                onKeyDown={onSearch}
                data-testid="sources-table-search"
              />
            </Col>
            <Col xs="6" lg="4" md="6">
              <Dropdown
                clearable
                placeholder="Filter by data source"
                fluid
                search
                selection
                options={dropDownValues}
                onChange={onFilterByDataSource}
              />
            </Col>
          </Row>
        </Card.Body>
        <Card.Body className="p-0">{renderOperations(operations, showMyQueries)}</Card.Body>
        <Card.Footer className="d-block">{renderPagination()}</Card.Footer>

        <BasicModal show={!!info} onHide={onModalHide} className="query-modal">
          <code>{info}</code>
        </BasicModal>
      </Card>
    </>
  );
};

OperationsTableCard.defaultProps = { offset: 0, showMyQueries: true };

const mapDispatchToProps: MapDispatchToProps<ActionProps, ComponentProps> = (
  dispatch,
): ActionProps => ({
  actions: bindActionCreators(operationsActions, dispatch),
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    operations: reduxStore.get('operations') as OperationsState,
    user: reduxStore.get('user') as UserState,
  };
};

const connector = withRouter<ComponentProps, any>( // eslint-disable-line @typescript-eslint/no-explicit-any
  connect(mapStateToProps, mapDispatchToProps)(OperationsTableCard),
);

export { connector as OperationsTableCard, connector as default };

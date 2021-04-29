import { List, Map } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import { fetchOperation, setOperation } from '../../actions/operations';
import { fetchActiveSource, setActiveSource } from '../../actions/sources';
import { OperationDataTableContainer } from '../../components/OperationDataTableContainer/OperationDataTableContainer';
import { ReduxStore } from '../../store';
import { OperationDataMap, OperationMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { api, getSourceIDFromOperation } from '../../utils';
import { useOperation } from '../../utils/hooks/operations';
import * as pageActions from './actions';
import { QueryDataState, queryDataReducerId } from './reducers';

interface ActionProps {
  actions: typeof pageActions & {
    fetchOperation: typeof fetchOperation;
    setOperation: typeof setOperation;
    fetchActiveSource: typeof fetchActiveSource;
    setActiveSource: typeof setActiveSource;
  };
}
interface ReduxState {
  page: QueryDataState;
  operations: List<OperationMap>;
  activeOperation?: OperationMap;
  source?: SourceMap;
  token: string;
}
interface RouteParams {
  id?: string;
}
type QueryDataProps = ActionProps & ReduxState & RouteComponentProps<RouteParams>;

const QueryData: FunctionComponent<QueryDataProps> = (props) => {
  const { id } = props.match.params;
  const [loading, setLoading] = useState(props.page.get('loading') as boolean);
  const { operation: activeOperation, loading: operationLoading } = useOperation(
    parseInt(id as string),
  );
  const setOperation = (id?: string) => {
    if (!id) {
      return;
    }
    const operation = props.operations.find((ope) => ope.get('id') === parseInt(id, 10));
    if (operation) {
      props.actions.setOperation(operation);
      const sourceID = getSourceIDFromOperation(operation);
      if (sourceID) {
        props.actions.fetchActiveSource(sourceID);
      }
    } else {
      props.actions.fetchOperation(id);
    }
  };

  // TODO: remove useEffect
  useEffect(() => {
    setLoading((props.page.get('loading') as boolean) || operationLoading);
  }, [props.page.get('loading'), operationLoading]);

  useEffect(() => {
    const operation = props.activeOperation;
    const { id } = props.match.params;
    if (!operation) {
      setOperation(id);
    } else {
      const sourceID = getSourceIDFromOperation(operation);
      if (sourceID) {
        props.actions.fetchActiveSource(sourceID);
      }
    }
    if (id) {
      props.actions.fetchOperationData({ id, limit: 10, offset: 0 });
    }

    return () => {
      // on unmount
      props.actions.setOperationData(Map(), {} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  }, []);

  const renderTable = () => {
    const { page, actions, match, activeOperation: operation } = props;
    const data = page.getIn(['data', 'results']) as List<OperationDataMap>;
    const loading = page.get('loading') as boolean;
    const { fetchOperationData: fetchData } = actions;
    const { id } = match.params;

    if (id && data && data.count() !== 0 && operation) {
      return (
        <OperationDataTableContainer
          operation={operation}
          id={id}
          list={data}
          limit={props.page.get('limit') as number}
          offset={props.page.get('offset') as number}
          count={operation.get('row_count') as number | null}
          fetchData={fetchData}
        />
      );
    }
    const alert = props.page.get('alert') as string;
    if (alert) {
      return <Alert variant="danger">{alert}</Alert>;
    }

    return <div>{loading ? 'Loading ...' : 'No results found'}</div>;
  };

  const token = props.token;
  const operation = activeOperation;
  const title = operation ? operation.get('name') : 'Query Data';

  return (
    <Row>
      <Col>
        <Dimmer active={loading} inverted>
          <Loader content="Loading" />
        </Dimmer>

        <Card>
          <Card.Header className="card-header-text card-header-danger">
            <Card.Text>{title}</Card.Text>
            <Form action={`${api.routes.EXPORT}${id}/`} method="POST">
              <Form.Control type="hidden" name="token" value={token} />
              <Button type="submit" variant="danger" size="sm">
                Export to CSV
              </Button>
            </Form>
          </Card.Header>
          <Card.Body>{renderTable()}</Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

const mapDispatchToProps: MapDispatchToProps<ActionProps, Record<string, unknown>> = (
  dispatch,
): ActionProps => ({
  actions: bindActionCreators(
    {
      ...pageActions,
      fetchActiveSource,
      setActiveSource,
      fetchOperation,
      setOperation,
    },
    dispatch,
  ),
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => ({
  page: reduxStore.get(`${queryDataReducerId}`),
  operations: reduxStore.getIn(['operations', 'operations']),
  activeOperation: reduxStore.getIn(['operations', 'activeOperation']),
  source: reduxStore.getIn(['sources', 'activeSource']),
  token: reduxStore.get('token'),
});

const connector = connect(mapStateToProps, mapDispatchToProps)(QueryData);

export { connector as QueryData, connector as default };

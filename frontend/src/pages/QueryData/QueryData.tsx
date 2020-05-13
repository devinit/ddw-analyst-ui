import { List } from 'immutable';
import * as React from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import { fetchOperation, setOperation } from '../../actions/operations';
import { fetchActiveSource, setActiveSource } from '../../actions/sources';
import { OperationDataTable } from '../../components/OperationDataTable/OperationDataTable';
import { ReduxStore } from '../../store';
import { OperationDataMap, OperationMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { api, getSourceIDFromOperation } from '../../utils';
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

class QueryData extends React.Component<QueryDataProps> {
  render() {
    const loading = this.props.page.get('loading') as boolean;
    const token = this.props.token;
    const { id } = this.props.match.params;
    const operation = this.props.activeOperation;
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
            <Card.Body>{this.renderTable()}</Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  componentDidMount() {
    const operation = this.props.activeOperation;
    const { id } = this.props.match.params;
    if (!operation) {
      this.setOperation(id);
    } else {
      const sourceID = getSourceIDFromOperation(operation);
      if (sourceID) {
        this.props.actions.fetchActiveSource(sourceID);
      }
    }
    if (id) {
      this.props.actions.fetchOperationData({ id, limit: 10, offset: 0 });
    }
  }

  componentWillUnmount() {
    this.props.actions.setOperationData(List(), {});
  }

  private renderTable() {
    const data = this.props.page.getIn(['data', 'results']) as List<OperationDataMap>;
    const columns =
      this.props.source && (this.props.source.get('columns') as ColumnList | undefined);
    const loading = this.props.page.get('loading') as boolean;
    const { fetchOperationData: fetchData } = this.props.actions;
    const { id } = this.props.match.params;

    if (id && data && data.count() !== 0) {
      return (
        <OperationDataTable
          id={id}
          list={data}
          columns={columns}
          limit={this.props.page.get('limit') as number}
          offset={this.props.page.get('offset') as number}
          fetchData={fetchData}
        />
      );
    }
    const alert = this.props.page.get('alert') as string;
    if (alert) {
      return <Alert variant="danger">{alert}</Alert>;
    }

    return <div>{loading ? 'Loading ...' : 'No results found'}</div>;
  }

  private setOperation(id?: string) {
    if (!id) {
      return;
    }
    const operation = this.props.operations.find((ope) => ope.get('id') === parseInt(id, 10));
    if (operation) {
      this.props.actions.setOperation(operation);
      const sourceID = getSourceIDFromOperation(operation);
      if (sourceID) {
        this.props.actions.fetchActiveSource(sourceID);
      }
    } else {
      this.props.actions.fetchOperation(id);
    }
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
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

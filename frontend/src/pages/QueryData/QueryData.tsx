import { List } from 'immutable';
import { unparse } from 'papaparse';
import * as React from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import { fetchOperation, setOperation } from '../../actions/operations';
import { fetchActiveSource, setActiveSource } from '../../actions/sources';
import { OperationDataTable } from '../../components/OperationDataTable/OperationDataTable';
import { PaginatedContent } from '../../components/PaginatedContent';
import { ReduxStore } from '../../store';
import { OperationDataMap, OperationMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getSourceIDFromOperation } from '../../utils';
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
}
interface RouteParams {
  id?: string;
}
type QueryDataProps = ActionProps & ReduxState & RouteComponentProps<RouteParams>;

class QueryData extends React.Component<QueryDataProps> {
  render() {
    return (
      <Row>
        <Col>
          <Card>
            <Card.Header className="card-header-text card-header-danger">
              <Card.Text>Query Data</Card.Text>
              <div>
                <Button variant="danger" size="sm" onClick={ this.exportToCSV }>
                  Export to CSV
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="table-full-width">
              { this.renderTable() }
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  componentDidMount() {
    const operation = this.props.page.get('operation') as OperationMap | undefined;
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
      this.props.actions.fetchOperationData(id);
    }
  }

  componentWillUnmount() {
    this.props.actions.setOperationData(List());
  }

  private renderTable() {
    const data = this.props.page.getIn([ 'data', 'results' ]) as List<OperationDataMap>;
    const columns = this.props.source && this.props.source.get('columns') as ColumnList | undefined;

    if (data && data.count() !== 0) {
      return (
        <PaginatedContent
          content={ <OperationDataTable list={ data } columns={ columns }/> }
          list={ data || List() }
          limit={ 10 }
          offset={ 0 }
        />
      );
    }
    return <div>No results found</div>;
  }

  private setOperation(id?: string) {
    if (!id) {
      return;
    }
    const operation = this.props.operations.find(ope => ope.get('id') === parseInt(id, 10));
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

  private exportToCSV = () => {
    const data = this.props.page.getIn([ 'data', 'results' ]) as List<OperationDataMap>;
    if (data.count()) {
      const csv = encodeURI(`data:text/csv;charset=utf-8,${unparse(data.toJS())}`);
      const filename = 'export.csv';
      const link = document.createElement('a');
      link.setAttribute('href', csv);
      link.setAttribute('download', filename);
      link.click();
    }
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators({
    ...pageActions,
    fetchActiveSource,
    setActiveSource,
    fetchOperation,
    setOperation
  }, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => ({
  page: reduxStore.get(`${queryDataReducerId}`),
  operations: reduxStore.getIn([ 'operations', 'operations' ]),
  activeOperation: reduxStore.getIn([ 'operations', 'activeOperation' ]),
  source: reduxStore.getIn([ 'sources', 'activeSource' ])
});

const connector = connect(mapStateToProps, mapDispatchToProps)(QueryData);

export { connector as QueryData, connector as default };

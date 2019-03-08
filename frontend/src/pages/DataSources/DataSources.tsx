import { List } from 'immutable';
import * as React from 'react';
import { Card, Col, Row, Table } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as sourcesActions from '../../actions/sources';
import { SourceMap, SourcesState } from '../../reducers/sources';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';

interface ActionProps {
  actions: typeof sourcesActions;
}
interface ReduxState {
  user: UserState;
  sources: SourcesState;
}
type DataSourcesProps = ReduxState & ActionProps;

class DataSources extends React.Component<DataSourcesProps> {
  render() {
    return (
      <Row>
        <Col lg={ 8 }>
          <Card>
            <Card.Body>
              <Table responsive hover striped>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Indicator</th>
                    <th>Updated On</th>
                  </tr>
                </thead>
                <tbody>
                  { this.renderRows() }
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={ 4 }>
          <Card>
            <Card.Body>
              <Card.Text>Source Details Go Here!</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  componentDidMount() {
    this.props.actions.fetchSources();
  }

  private renderRows() {
    const sources = this.props.sources.get('sources') as List<SourceMap>;
    if (sources && sources.size) {
      return sources.map((source, index) => (
        <tr key={ index + 1 }>
          <td>{ index }</td>
          <td>{ source.get('indicator') }</td>
          <td>{ new Date(source.get('last_updated_on') as string).toDateString() }</td>
        </tr>
      ));
    }

    return null;
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators(sourcesActions, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    user: reduxStore.get('user') as UserState,
    sources: reduxStore.get('sources') as SourcesState
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(DataSources);

export { connector as DataSources };

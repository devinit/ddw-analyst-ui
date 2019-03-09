import classNames from 'classnames';
import { List } from 'immutable';
import * as React from 'react';
import { Card, Col, Nav, Row, Tab, Table } from 'react-bootstrap';
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
    const sources = this.props.sources.get('sources') as List<SourceMap>;
    const activeSourceIndex = this.props.sources.get('activeSourceIndex') as number;

    return (
      <Row>
        <Col lg={ 7 }>
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
                  { this.renderRows(sources, activeSourceIndex) }
                </tbody>
              </Table>

            </Card.Body>
          </Card>
        </Col>

        <Col lg={ 5 }>
          <Tab.Container defaultActiveKey="metadata">
            <Card>
              <Card.Body>

                <Nav variant="pills" className="nav-pills-danger" role="tablist">
                  <Nav.Item>
                    <Nav.Link eventKey="metadata">Metadata</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="columns">Columns</Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content>
                  <Tab.Pane eventKey="metadata">
                    { this.renderMetadata(sources, activeSourceIndex) }
                  </Tab.Pane>
                  <Tab.Pane eventKey="columns">
                    Columns
                  </Tab.Pane>
                </Tab.Content>

              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>
      </Row>
    );
  }

  componentDidMount() {
    this.props.actions.fetchSources();
  }

  private renderRows(sources: List<SourceMap>, activeSourceIndex: number) {
    if (sources && sources.size) {
      return sources.map((source, index) => (
        <tr
          key={ index }
          className={ classNames({ 'table-danger':  activeSourceIndex === index }) }
          onClick={ () => this.onRowClick(index) }
        >
          <td>{ index + 1 }</td>
          <td>{ source.get('indicator') }</td>
          <td>{ new Date(source.get('last_updated_on') as string).toDateString() }</td>
        </tr>
      ));
    }

    return null;
  }

  private renderMetadata(sources: List<SourceMap>, activeSourceIndex: number) {
    const source = sources.get(activeSourceIndex);
    if (source) {
      return (
        <React.Fragment>
          <div className="font-weight-bold">Source</div>
          <div className="font-weight-light">
            { source.get('source') }
            <span className="text-uppercase">
              { ` (${source.get('source_acronym')})` }
            </span>
          </div>
          <div className="font-weight-bold">Abstract</div>
          <div className="font-weight-light">
            { source.get('description') }
          </div>
          <hr/>
          <div className="font-weight-light">
            <a href={ source.get('source_url') as string }>
              <i className="material-icons mr-2">business</i>
              <span className="align-middle">{ source.get('source_url') }</span>
            </a>
          </div>
          <div className="font-weight-light">
            <a href={ source.get('download_path') as string }>
              <i className="material-icons mr-2">cloud_download</i>
              <span className="align-middle">{ source.get('download_path') }</span>
            </a>
          </div>
        </React.Fragment>
      );
    }
  }

  private onRowClick(activeSourceIndex: number) {
    this.props.actions.setActiveSourceIndex(activeSourceIndex);
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

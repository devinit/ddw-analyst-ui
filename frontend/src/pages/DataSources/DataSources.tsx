import { List } from 'immutable';
import { SourceDetailsTab } from '../../components/SourceDetailsTab';
import { Col, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as sourcesActions from '../../actions/sources';
import * as React from 'react';
import * as pageActions from './actions';
import { SourcesTable } from '../../components/SourcesTable';
import { SourcesState } from '../../reducers/sources';
import { SourceMap } from '../../types/sources';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
import { DataSourcesState, dataSourcesReducerId } from './reducers';
import { Dimmer, Loader, Placeholder, Segment } from 'semantic-ui-react';

interface ActionProps {
  actions: typeof sourcesActions & typeof pageActions;
}
interface ReduxState {
  user: UserState;
  sources: SourcesState;
  page: DataSourcesState;
}
type DataSourcesProps = ReduxState & ActionProps;

class DataSources extends React.Component<DataSourcesProps> {
  render() {
    const sources = this.props.sources.get('sources') as List<SourceMap>;
    const loading = this.props.sources.get('loading') as boolean;
    const activeSource = this.props.page.get('activeSource') as SourceMap | undefined;

    return (
      <Row>
        <Col lg={ 7 }>
          <Dimmer active={ loading } inverted>
            <Loader content="Loading" />
          </Dimmer>

          <SourcesTable sources={ sources } activeSource={ activeSource } onRowClick={ this.onRowClick }/>

        </Col>

        <Col lg={ 5 }>
          { this.renderDetailsTab(activeSource, loading) }
        </Col>
      </Row>
    );
  }

  componentDidMount() {
    const sources = this.props.sources.get('sources') as List<SourceMap>;
    const loading = this.props.sources.get('loading') as boolean;
    if (!sources.count() && !loading) {
      this.props.actions.fetchSources();
    }
  }

  private renderDetailsTab(activeSource: SourceMap | undefined, loading = false) {
    if (activeSource && !loading) {
      return <SourceDetailsTab source={ activeSource }/>;
    }

    return (
      <Segment>
        <Placeholder>
          <Placeholder.Header>
            <Placeholder.Line length="very short" />
            <Placeholder.Line length="medium" />
          </Placeholder.Header>
          <Placeholder.Paragraph>
            <Placeholder.Line length="short" />
          </Placeholder.Paragraph>
        </Placeholder>
      </Segment>
    );
  }

  private onRowClick = (activeSource: SourceMap) => {
    this.props.actions.setActiveSource(activeSource);
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators({ ...sourcesActions, ...pageActions }, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    user: reduxStore.get('user') as UserState,
    sources: reduxStore.get('sources') as SourcesState,
    page: reduxStore.get(`${dataSourcesReducerId}`)
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(DataSources);

export { connector as DataSources };

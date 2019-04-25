import { List } from 'immutable';
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader, Placeholder, Segment } from 'semantic-ui-react';
import * as sourcesActions from '../../actions/sources';
import { SourceDetailsTab } from '../../components/SourceDetailsTab';
import { SourcesTableCard } from '../../components/SourcesTableCard';
import { SourcesState } from '../../reducers/sources';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
import { SourceMap } from '../../types/sources';
import * as pageActions from './actions';
import { DataSourcesState, dataSourcesReducerId } from './reducers';

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

          <SourcesTableCard
            sources={ sources }
            activeSource={ activeSource }
            count={ this.props.sources.get('count') }
            onRowClick={ this.onRowClick }
          />

        </Col>

        <Col lg={ 5 }>
          { this.renderDetailsTab(activeSource, loading) }
        </Col>
      </Row>
    );
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

export { connector as DataSources, connector as default };

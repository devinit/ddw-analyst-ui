import { List } from 'immutable';
import React, { ReactElement, ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader, Placeholder, Segment, Modal } from 'semantic-ui-react';
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
type DataSourcesProps = ReduxState & ActionProps & RouteComponentProps;

class DataSources extends React.Component<DataSourcesProps> {
  render(): ReactElement {
    const sources = this.props.sources.get('sources') as List<SourceMap>;
    const loading = this.props.sources.get('loading') as boolean;
    const activeSource = this.props.page.get('activeSource') as SourceMap | undefined;

    return (
      <Row>
        <Col>
          <Dimmer active={loading} inverted>
            <Loader content="Loading" />
          </Dimmer>

          <SourcesTableCard
            loading={loading}
            sources={sources}
            limit={this.props.sources.get('limit') as number}
            offset={this.props.sources.get('offset') as number}
            activeSource={activeSource}
            count={this.props.sources.get('count') as number}
            onRowClick={this.onRowClick}
          />
        </Col>

        {/* <Col lg={5}>{this.renderDetailsTab(activeSource, loading)}</Col> */}
      </Row>
    );
  }

  private renderDetailsTab(activeSource: SourceMap | undefined, loading = false): ReactNode {
    if (activeSource && !loading) {
      return <SourceDetailsTab source={activeSource} />;
    }

    return (
      <Modal>
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
      </Modal>
    );
  }

  private onRowClick = (activeSource: SourceMap): void => {
    this.props.actions.setActiveSource(activeSource);
    console.log('click');
  };
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, Record<string, unknown>> = (
  dispatch,
): ActionProps => ({
  actions: bindActionCreators({ ...sourcesActions, ...pageActions }, dispatch),
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    user: reduxStore.get('user') as UserState,
    sources: reduxStore.get('sources') as SourcesState,
    page: reduxStore.get(`${dataSourcesReducerId}`),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(DataSources);

export { connector as DataSources, connector as default };

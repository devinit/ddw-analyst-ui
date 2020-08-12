import { List } from 'immutable';
import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import * as sourcesActions from '../../actions/sources';
import { SourcesTableCard } from '../../components/SourcesTableCard';
import { SourcesState } from '../../reducers/sources';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
import { SourceMap } from '../../types/sources';
import * as pageActions from './actions';
import { dataSourcesReducerId, DataSourcesState } from './reducers';

interface ActionProps {
  actions: typeof sourcesActions & typeof pageActions;
}
interface ReduxState {
  user: UserState;
  sources: SourcesState;
  page: DataSourcesState;
}

export interface DataSource {
  onMetadataClick?: (source: SourceMap) => void;
  onDatasetClick?: (source: SourceMap, sourceId: number) => void;
}
type DataSourcesProps = ReduxState & ActionProps & RouteComponentProps;

const DataSources: FunctionComponent<DataSourcesProps> = (props) => {
  const sources = props.sources.get('sources') as List<SourceMap>;
  const loading = props.sources.get('loading') as boolean;
  const activeSource = props.page.get('activeSource') as SourceMap | undefined;

  return (
    <Row>
      <Col>
        <Dimmer active={loading} inverted>
          <Loader content="Loading" />
        </Dimmer>
        <SourcesTableCard
          loading={loading}
          sources={sources}
          limit={props.sources.get('limit') as number}
          offset={props.sources.get('offset') as number}
          activeSource={activeSource}
          count={props.sources.get('count') as number}
        />
      </Col>
    </Row>
  );
};

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

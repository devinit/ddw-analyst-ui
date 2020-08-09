import { List } from 'immutable';
import React, { ReactNode, FunctionComponent, useState, createContext } from 'react';
import { Col, Row, Modal } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader } from 'semantic-ui-react';
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

export interface DataSource {
  onMetadataClick?: (source: SourceMap) => void;
  onDatasetClick?: (source: SourceMap, sourceId: number) => void;
}
type DataSourcesProps = ReduxState & ActionProps & RouteComponentProps;

export const DataSourcesContext = createContext<DataSource>({});

const DataSources: FunctionComponent<DataSourcesProps> = (props) => {
  const sources = props.sources.get('sources') as List<SourceMap>;
  const loading = props.sources.get('loading') as boolean;
  const activeSource = props.page.get('activeSource') as SourceMap | undefined;
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();

  const renderDetailsTab = (activeSource: SourceMap | undefined, loading = false): ReactNode => {
    if (activeSource && !loading && showModal) {
      return (
        <Modal show={showModal} onHide={hideModal}>
          <SourceDetailsTab source={activeSource} />
        </Modal>
      );
    }
  };

  const handleMetadata = (activeSource: SourceMap) => {
    props.actions.setActiveSource(activeSource);
    setShowModal(true);
  };

  const handleDataSet = (activeSource: SourceMap, sourceId: number): void => {
    props.actions.setActiveSource(activeSource);
    const path = `${sourceId}/datasets`;
    history.push(path);
  };

  const hideModal = () => {
    setShowModal(false);
  };

  return (
    <DataSourcesContext.Provider
      value={{
        onMetadataClick: handleMetadata,
        onDatasetClick: handleDataSet,
      }}
    >
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
        {showModal ? renderDetailsTab(activeSource, loading) : null}
      </Row>
    </DataSourcesContext.Provider>
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

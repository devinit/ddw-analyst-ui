import * as pageActions from './actions';
import { List } from 'immutable';
import { Col, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as sourcesActions from '../../actions/sources';
import * as React from 'react';
import { SourceDetailsTab } from '../../components/SourceDetailsTab';
import { SourcesTable } from '../../components/SourcesTable';
import { SourceMap, SourcesState } from '../../reducers/sources';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
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
    const activeSource = this.props.page.get('activeSource');

    return (
      <Row>
        <Col lg={ 7 }>
          <SourcesTable
            sources={ sources }
            activeSource={ activeSource }
            onRowClick={ this.onRowClick }
          />
        </Col>

        <Col lg={ 5 }>
          { activeSource ? <SourceDetailsTab source={ activeSource }/> : null }
        </Col>
      </Row>
    );
  }

  componentDidMount() {
    this.props.actions.fetchSources();
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

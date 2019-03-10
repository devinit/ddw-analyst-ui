import * as sourcesActions from '../../actions/sources';
import { List } from 'immutable';
import { Col, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as React from 'react';
import { SourceDetailsTab } from '../../components/SourceDetailsTab';
import { SourcesTable } from '../../components/SourcesTable';
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
    const source = sources.get(activeSourceIndex);

    return (
      <Row>
        <Col lg={ 7 }>
          <SourcesTable
            sources={ sources }
            activeSourceIndex={ activeSourceIndex }
            onRowClick={ this.onRowClick }
          />
        </Col>

        <Col lg={ 5 }>
          { source ? <SourceDetailsTab source={ source }/> : null }
        </Col>
      </Row>
    );
  }

  componentDidMount() {
    this.props.actions.fetchSources();
  }

  private onRowClick = (activeSourceIndex: number) => {
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

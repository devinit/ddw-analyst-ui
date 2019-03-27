import { List } from 'immutable';
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import * as operationsActions from '../../actions/operations';
import { OperationsTableCard } from '../../components/OperationsTableCard';
import { OperationsState } from '../../reducers/operations';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
import { OperationMap } from '../../types/operations';

interface ActionProps {
  actions: typeof operationsActions;
}
interface ReduxState {
  user: UserState;
  operations: OperationsState;
}
type HomeProps = ActionProps & ReduxState;

class Home extends React.Component<HomeProps> {
  render() {
    const operations = this.props.operations.get('operations') as List<OperationMap>;
    const loading = this.props.operations.get('loading') as boolean;

    return (
      <Row>
        <Col>
          <Dimmer active={ loading } inverted>
            <Loader content="Loading" />
          </Dimmer>
        </Col>

        <OperationsTableCard operations={ operations } onRowClick={ () => null }/>
      </Row>
    );
  }

  componentDidMount() {
    const operations = this.props.operations.get('operations') as List<OperationMap>;
    const loading = this.props.operations.get('loading') as boolean;
    if (!operations.count() && !loading) {
      this.props.actions.fetchOperations();
    }
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators({ ...operationsActions }, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    user: reduxStore.get('user') as UserState,
    operations: reduxStore.get('operations') as OperationsState
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(Home);

export { connector as Home, connector as default };

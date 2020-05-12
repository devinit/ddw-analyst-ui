import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as operationsActions from '../../actions/operations';
import { OperationsTableCard } from '../../components/OperationsTableCard';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
import * as pageActions from './actions';
import { HomeState, homeReducerId } from './reducers';

interface ActionProps {
  actions: typeof operationsActions & typeof pageActions;
}
interface ReduxState {
  user: UserState;
  page: HomeState;
}
type HomeProps = ActionProps & ReduxState & RouteComponentProps;

class Home extends React.Component<HomeProps> {
  render() {
    return (
      <Row>
        <Col>
          <OperationsTableCard
            limit={ this.props.page.getIn([ 'operations', 'limit' ]) }
            offset={ this.props.page.getIn([ 'operations', 'offset' ]) }
          />
        </Col>
      </Row>
    );
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators({ ...operationsActions, ...pageActions }, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    user: reduxStore.get('user') as UserState,
    page: reduxStore.get(`${homeReducerId}`)
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(Home);

export { connector as Home, connector as default };

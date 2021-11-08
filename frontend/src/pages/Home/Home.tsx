import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as operationsActions from '../../actions/operations';
import { OperationsTableCard } from '../../components/OperationsTableCard';
import { SourcesContext } from '../../context';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
import { useSources } from '../../utils/hooks';
import * as pageActions from './actions';
import { homeReducerId, HomeState } from './reducers';

interface ActionProps {
  actions: typeof operationsActions & typeof pageActions;
}
interface ReduxState {
  user: UserState;
  page: HomeState;
}
type HomeProps = ActionProps & ReduxState & RouteComponentProps;

const Home: FunctionComponent<HomeProps> = (props) => {
  const sources = useSources({ limit: 200, offset: 0 });

  return (
    <Row>
      <Col>
        <SourcesContext.Provider value={{ sources }}>
          <OperationsTableCard
            limit={props.page.getIn(['operations', 'limit'])}
            offset={props.page.getIn(['operations', 'offset'])}
            showMyQueries
          />
        </SourcesContext.Provider>
      </Col>
    </Row>
  );
};

const mapDispatchToProps: MapDispatchToProps<ActionProps, Record<string, unknown>> = (
  dispatch,
): ActionProps => ({
  actions: bindActionCreators({ ...operationsActions, ...pageActions }, dispatch),
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    user: reduxStore.get('user') as UserState,
    page: reduxStore.get(`${homeReducerId}`),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(Home);

export { connector as Home, connector as default };

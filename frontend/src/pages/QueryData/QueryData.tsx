import * as React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ReduxStore } from '../../store';
import * as pageActions from './actions';
import { QueryDataState, queryDataReducerId } from './reducers';

interface ActionProps {
  actions: typeof pageActions;
}
interface ReduxState {
  page: QueryDataState;
}

type QueryDataProps = ActionProps & ReduxState;

class QueryData extends React.Component<QueryDataProps> {
  render() {
    return (
      <div>
        Query Data Goes Here!
      </div>
    );
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators(pageActions, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => ({
  page: reduxStore.get(`${queryDataReducerId}`)
});

const connector = connect(mapStateToProps, mapDispatchToProps)(QueryData);

export { connector as QueryData, connector as default };

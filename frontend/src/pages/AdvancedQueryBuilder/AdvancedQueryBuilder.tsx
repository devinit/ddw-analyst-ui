import axios, { AxiosResponse } from 'axios';
import { List } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import { deleteOperation, fetchOperation, setOperation } from '../../actions/operations';
import * as sourcesActions from '../../actions/sources';
import { OperationTabContainer } from '../../components/OperationTabContainer';
import { QuerySentenceBuilder } from '../../components/QuerySentenceBuilder';
import { SourcesContext } from '../../context';
import { TokenState } from '../../reducers/token';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
import { Operation, OperationMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { api } from '../../utils';
import { useOperation, useSourceFromAdvancedOperation, useSources } from '../../utils/hooks';
import * as pageActions from './actions';
import { AdvancedQueryBuilderState, queryBuilderReducerId } from './reducers';

type RouterParams = {
  id?: string;
};
interface ReduxState {
  source?: SourceMap;
  operations: List<OperationMap>;
  activeOperation?: OperationMap;
  token: TokenState;
  page: AdvancedQueryBuilderState;
  user: UserState;
}
interface ActionProps {
  actions: typeof sourcesActions &
    typeof pageActions & {
      fetchOperation: typeof fetchOperation;
      setActiveOperation: typeof setOperation;
      deleteOperation: typeof deleteOperation;
    };
}
type QueryBuilderProps = RouteComponentProps & ReduxState<RouterParams>;

const AdvancedQueryBuilder: FunctionComponent<QueryBuilderProps> = (props) => {
  const { id: operationID } = props.match.params;
  const [operation, setOperation] = useState<OperationMap>();
  const [editable, setEditable] = useState(false);
  const { loading, operation: pageOperation } = useOperation<OperationMap>(
    operationID ? parseInt(operationID) : undefined,
  );
  const sources = useSources({ limit: 200, offset: 0 });
  const history = useHistory();
  const { source: operationSource } = useSourceFromAdvancedOperation(props.activeOperation);

  useEffect(() => {
    // the page operation has precedence i.e in the event of editing
    if (pageOperation) {
      setOperation(pageOperation);
    }
  }, [pageOperation]);
  useEffect(() => {
    props.actions.setActiveOperation(operation);
    setEditable(isEditable(operation));
  }, [operation]);

  const onSaveOperation = (preview?: boolean) => {
    console.log('Saving:', preview);
    if (!operation) {
      return;
    }
    const url = api.routes.DATASETS;
    const data: Operation = operation.toJS() as Operation;
    if (props.token) {
      axios
        .request({
          url,
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${props.token}`,
          },
          data,
        })
        .then((response: AxiosResponse<Operation>) => {
          if (response.status === 200 || response.status === 201) {
            props.actions.operationSaved(true);
            if (preview) {
              history.push(`/queries/data/${response.data.id}/`);
            } else {
              history.push('/');
            }
          }
        })
        .catch((error) => {
          props.actions.operationSaved(false);
        });
    }
  };

  const onDeleteOperation = (ope?: OperationMap) => {
    const opeID = ope?.get('id') as string | undefined;
    if (opeID) {
      props.actions.deleteOperation(opeID, history);
    } else {
      props.actions.setActiveOperation();
    }
  };

  const onUpdateOperation = (ope?: OperationMap) => {
    setOperation(ope);
  };

  const isEditable = (operation?: OperationMap) => {
    const user = props.user.get('username') as string;
    const isSuperUser = props.user.get('is_superuser') as boolean;

    return !operation || !operation.get('id') || user === operation.get('user') || isSuperUser;
  };

  return (
    <Row>
      <Col>
        <React.Fragment>
          <Dimmer active={loading || !sources.count()} inverted>
            <Loader content="Loading" />
          </Dimmer>
          {!loading && sources.count() ? (
            <SourcesContext.Provider value={{ sources }}>
              <OperationTabContainer
                editable={editable}
                operation={props.activeOperation}
                onSave={onSaveOperation}
                onDelete={onDeleteOperation}
                onUpdate={onUpdateOperation}
              >
                <QuerySentenceBuilder
                  activeSource={operationSource}
                  operation={operation}
                  onUpdateOperation={onUpdateOperation}
                  editable={editable}
                />
              </OperationTabContainer>
            </SourcesContext.Provider>
          ) : null}
        </React.Fragment>
      </Col>
    </Row>
  );
};

const mapDispatchToProps: MapDispatchToProps<ActionProps, Record<string, unknown>> = (
  dispatch,
): ActionProps => ({
  actions: bindActionCreators(
    {
      ...sourcesActions,
      ...pageActions,
      setActiveOperation: setOperation,
      deleteOperation,
    },
    dispatch,
  ),
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    token: reduxStore.get('token') as TokenState,
    operations: reduxStore.getIn(['operations', 'operations']),
    activeOperation: reduxStore.getIn(['operations', 'activeOperation']),
    page: reduxStore.get(`${queryBuilderReducerId}`),
    user: reduxStore.get('user') as UserState,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(AdvancedQueryBuilder);

export { connector as default };

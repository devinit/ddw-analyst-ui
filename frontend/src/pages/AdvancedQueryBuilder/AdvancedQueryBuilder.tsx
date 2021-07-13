import axios, { AxiosResponse } from 'axios';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { OperationTabContainer } from '../../components/OperationTabContainer';
import { QuerySentenceBuilder } from '../../components/QuerySentenceBuilder';
import { SourcesContext } from '../../context';
import { Operation, OperationMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { api, localForageKeys } from '../../utils';
import { useOperation, useSourceFromAdvancedOperation, useSources } from '../../utils/hooks';
import * as localForage from 'localforage';
import { boolean } from 'yup';
// import { fromJS, List } from 'immutable';

type RouterParams = {
  id?: string;
};
type QueryBuilderProps = RouteComponentProps<RouterParams>;

const AdvancedQueryBuilder: FunctionComponent<QueryBuilderProps> = (props) => {
  const { id: operationID } = props.match.params;
  const [token, setToken] = useState('');
  const [user, setUser] = useState<{ id: number; username: string; is_superuser: boolean }>();
  const [operation, setOperation] = useState<OperationMap>();
  const [editable, setEditable] = useState(false);
  const [activeSource, setActiveSource] = useState<SourceMap>();
  const { loading, operation: pageOperation } = useOperation<OperationMap>(
    operationID ? parseInt(operationID) : undefined,
  );
  const sources = useSources({ limit: 200, offset: 0 });
  const history = useHistory();
  const { source: operationSource } = useSourceFromAdvancedOperation(operation);

  useEffect(() => {
    // the page operation has precedence i.e in the event of editing
    if (pageOperation) {
      setOperation(pageOperation);
      // setActiveSource(operationSource);
    }
  }, [pageOperation]);
  useEffect(() => {
    if (isEditable) {
      setEditable(isEditable(operation));
    }
  }, [operation]);
  useEffect(() => {
    localForage.getItem<string>(localForageKeys.API_KEY).then((_token) => {
      if (_token) setToken(_token);
    });
    localForage.getItem<string>(localForageKeys.USER).then((_user) => {
      if (_user) setUser(JSON.parse(_user));
    });
  }, []);

  const onSaveOperation = (preview?: boolean) => {
    console.log('Saving:', preview);
    if (!operation) {
      return;
    }
    const id = operation.get('id');
    const url = id ? `${api.routes.SINGLE_DATASET}${id}/` : api.routes.DATASETS;
    const data: Operation = operation.toJS() as Operation;

    axios
      .request({
        url,
        method: id ? 'put' : 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${token}`,
        },
        data,
      })
      .then((response: AxiosResponse<Operation>) => {
        if (response.status === 200 || response.status === 201) {
          history.push('/');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onDeleteOperation = (ope?: OperationMap) => {
    const operationID = ope?.get('id') as string | undefined;
    if (operationID) {
      const url = `${api.routes.SINGLE_DATASET}${operationID}/`;
      axios
        .request({
          url,
          method: 'delete',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${token}`,
          },
        })
        .then((response: AxiosResponse<Operation>) => {
          if (response.status === 200) {
            history.push('/');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setOperation(undefined);
    }
  };

  const onUpdateOperation = (ope?: OperationMap) => {
    setOperation(ope);
  };

  const isEditable = (operation?: OperationMap): boolean => {
    const isSuperUser = user?.is_superuser as boolean;

    return (
      !operation || !operation.get('id') || user?.username === operation.get('user') || isSuperUser
    );
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
                operation={operation}
                onSave={onSaveOperation}
                onDelete={onDeleteOperation}
                onUpdate={onUpdateOperation}
              >
                <QuerySentenceBuilder
                  activeSource={activeSource}
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

export default AdvancedQueryBuilder;

// const mapDispatchToProps: MapDispatchToProps<ActionProps, Record<string, unknown>> = (
//   dispatch,
// ): ActionProps => ({
//   actions: bindActionCreators(
//     {
//       ...sourcesActions,
//       ...pageActions,
//       setActiveOperation: setOperation,
//       deleteOperation,
//     },
//     dispatch,
//   ),
// });
// const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
//   return {
//     token: reduxStore.get('token') as TokenState,
//     operations: reduxStore.getIn(['operations', 'operations']),
//     activeOperation: reduxStore.getIn(['operations', 'activeOperation']),
//     page: reduxStore.get(`${queryBuilderReducerId}`),
//     user: reduxStore.get('user') as UserState,
//   };
// };

// const connector = connect(mapStateToProps, mapDispatchToProps)(AdvancedQueryBuilder);

// export { connector as default };

import axios, { AxiosResponse } from 'axios';
import { fromJS } from 'immutable';
import * as localForage from 'localforage';
import deepEqual from 'fast-deep-equal';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { OperationTabContainer } from '../../components/OperationTabContainer';
import { QuerySentenceBuilder } from '../../components/QuerySentenceBuilder';
import { SourcesContext } from '../../context';
import { Operation, OperationMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { api, localForageKeys } from '../../utils';
import { useOperation, useSources } from '../../utils/hooks';

type RouterParams = {
  id?: string;
};
type QueryBuilderProps = RouteComponentProps<RouterParams>;

const AdvancedQueryBuilder: FunctionComponent<QueryBuilderProps> = (props) => {
  const { id: operationID } = props.match.params;
  const [token, setToken] = useState('');
  const [user, setUser] = useState<{ id: number; username: string; is_superuser: boolean }>();
  const [operation, setOperation] = useState<OperationMap>();
  const [activeSource, setActiveSource] = useState<SourceMap>();
  const { loading, operation: pageOperation } = useOperation<OperationMap>(
    operationID ? parseInt(operationID) : undefined,
  );

  const sources = useSources({ limit: 200, offset: 0 });
  const history = useHistory();
  const prevPageOperation = useRef(pageOperation);
  useEffect(() => {
    // the page operation has precedence i.e in the event of editing
    if (!deepEqual(prevPageOperation.current, pageOperation)) {
      if (pageOperation) {
        setOperation(pageOperation);
        if (sources) {
          const advancedConfig = pageOperation.get('advanced_config');
          const sourceID = fromJS(advancedConfig)?.get('source');
          setActiveSource(sources.find((source) => source.get('id') === sourceID));
        }
        prevPageOperation.current = pageOperation;
      }
    }
  }, [pageOperation]);
  useEffect(() => {
    localForage.getItem<string>(localForageKeys.API_KEY).then((token) => {
      if (token) setToken(token);
    });
    localForage.getItem<string>(localForageKeys.USER).then((user) => {
      if (user) setUser(user as any);
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
                editable={isEditable(operation)}
                operation={operation}
                onSave={onSaveOperation}
                onDelete={onDeleteOperation}
                onUpdate={onUpdateOperation}
              >
                <QuerySentenceBuilder
                  activeSource={activeSource}
                  operation={operation}
                  onUpdateOperation={onUpdateOperation}
                  editable={isEditable(operation)}
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

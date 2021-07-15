import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { OperationTabContainer } from '../../components/OperationTabContainer';
import { QuerySentenceBuilder } from '../../components/QuerySentenceBuilder';
import { AppContext, SourcesContext } from '../../context';
import { AdvancedQueryOptionsMap, OperationMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { useOperation, useSources } from '../../utils/hooks';
import { deleteOperation, saveOperation } from './utils/operations';

type RouterParams = {
  id?: string;
};
type QueryBuilderProps = RouteComponentProps<RouterParams>;

const AdvancedQueryBuilder: FunctionComponent<QueryBuilderProps> = (props) => {
  const { id: operationID } = props.match.params;
  const { user, token } = useContext(AppContext);
  const [operation, setOperation] = useState<OperationMap>();
  const [activeSource, setActiveSource] = useState<SourceMap>();
  const { loading, operation: pageOperation } = useOperation<OperationMap>(
    operationID ? parseInt(operationID) : undefined,
  );

  const sources = useSources({ limit: 200, offset: 0 }) || null;
  const history = useHistory();
  useEffect(() => {
    // the page operation has precedence i.e in the event of editing
    if (pageOperation) setOperation(pageOperation);
    if (pageOperation && sources.count()) {
      const advancedConfig = pageOperation.get('advanced_config') as AdvancedQueryOptionsMap;
      if (advancedConfig && advancedConfig.get('source')) {
        setActiveSource(
          sources.find((source) => source.get('id') === (advancedConfig.get('source') as number)),
        );
      }
    }
  }, [pageOperation?.size, sources.count()]);

  const onSaveOperation = (): void => {
    saveOperation(operation as OperationMap)
      .then(() => history.push('/'))
      .catch((error) => console.log(`An error occured while saving operation:`, error.message));
  };

  const onDeleteOperation = (ope?: OperationMap) => {
    const operationID = ope?.get('id') as string | undefined;
    if (operationID && token) {
      deleteOperation(operationID, `${token}`)
        .then(() => history.push('/'))
        .catch((error) => console.log(`An error occured while deleting operation:`, error.message));
    } else {
      setOperation(undefined);
    }
  };

  const onUpdateOperation = (ope?: OperationMap) => {
    setOperation(ope);
  };

  const isEditable = (operation?: OperationMap): boolean => {
    const isSuperUser = user?.get('is_superuser') as boolean;

    return (
      !operation ||
      !operation.get('id') ||
      user?.get('username') === operation.get('user') ||
      isSuperUser
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
                  source={activeSource}
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

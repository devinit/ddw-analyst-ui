import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { DataSourceSelector } from '../../components/DataSourceSelector';
import { OperationTabContainer } from '../../components/OperationTabContainer';
import { Mode, QueryBuilderModeSelector } from '../../components/QueryBuilderModeSelector';
import { QuerySentenceBuilder } from '../../components/QuerySentenceBuilder';
import { SQLEditor } from '../../components/SQLEditor';
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
  const { user, token, activeOperation } = useContext(AppContext);
  const [operation, setOperation] = useState<OperationMap>();
  const [activeSource, setActiveSource] = useState<SourceMap>();
  const { loading, operation: pageOperation } = useOperation(
    operationID ? parseInt(operationID) : undefined,
  );
  const [mode, setMode] = useState<Mode>('gui');

  const sources = useSources({ limit: 200, offset: 0 }) || null;
  const history = useHistory();
  useEffect(() => {
    // the page operation has precedence i.e in the event of editing
    if (activeOperation) {
      setOperation(activeOperation);
      if (sources.count()) {
        const advancedConfig = activeOperation.get('advanced_config') as AdvancedQueryOptionsMap;
        if (advancedConfig && advancedConfig.get('source')) {
          setActiveSource(
            sources.find((source) => source.get('id') === (advancedConfig.get('source') as number)),
          );
        }
      }
    } else {
      setOperation(pageOperation as OperationMap);
      if (pageOperation && sources.count()) {
        const advancedConfig = (pageOperation as OperationMap).get(
          'advanced_config',
        ) as AdvancedQueryOptionsMap;
        if (advancedConfig && advancedConfig.get('source')) {
          setActiveSource(
            sources.find((source) => source.get('id') === (advancedConfig.get('source') as number)),
          );
        }
      }
      if ((pageOperation as OperationMap).get('is_raw') && mode !== 'sql') {
        setMode('sql');
      }
    }
  }, [(pageOperation as OperationMap)?.size, sources.count()]);

  const onSelectSource = (selectedSource: SourceMap) => setActiveSource(selectedSource);
  const onSelectMode = (selectedMode: Mode) => setMode(selectedMode);

  const onSaveOperation = (): void => {
    saveOperation(operation as OperationMap, `${token}`)
      .then(() => history.push('/'))
      .catch((error) => console.log(`An error occured while saving operation:`, error.message));
  };

  const onDeleteOperation = (ope?: OperationMap) => {
    const operationID = ope?.get('id') as string | undefined;
    if (operationID && token) {
      deleteOperation(operationID, `${token}`)
        .then(() => history.push('/'))
        .catch((error) => console.log(`An error occured while deleting operation:`, error.message));
      setOperation(undefined);
    } else {
      setOperation(undefined);
    }
  };

  const onUpdateOperation = (ope?: OperationMap) => setOperation(ope);

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
          <Alert variant="warning">
            <p>
              This feature is in <strong>BETA</strong> - <strong>for testing purposes only</strong>
            </p>
            <p>
              It currently only supports creation of basic <strong>SELECT</strong> queries
            </p>
          </Alert>
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
                <Row className="mb-3">
                  <DataSourceSelector
                    source={activeSource}
                    onSelect={onSelectSource}
                    className="col-lg-6"
                  />
                  <QueryBuilderModeSelector
                    mode={mode}
                    onSelect={onSelectMode}
                    className="col-lg-3"
                  />
                </Row>
                {mode === 'gui' ? (
                  <QuerySentenceBuilder
                    source={activeSource}
                    operation={operation}
                    onUpdateOperation={onUpdateOperation}
                    editable={isEditable(operation)}
                  />
                ) : (
                  <SQLEditor
                    source={activeSource}
                    operation={operation}
                    onUpdateOperation={onUpdateOperation}
                  />
                )}
              </OperationTabContainer>
            </SourcesContext.Provider>
          ) : null}
        </React.Fragment>
      </Col>
    </Row>
  );
};

export default AdvancedQueryBuilder;

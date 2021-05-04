import React, { FunctionComponent, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { OperationTabContainer } from '../../components/OperationTabContainer';
import { SourcesContext } from '../../context';
import { OperationMap } from '../../types/operations';
import { useOperation, useSources } from '../../utils/hooks';

type RouterParams = {
  id?: string;
};
type QueryBuilderProps = RouteComponentProps<RouterParams>;

const AdvancedQueryBuilder: FunctionComponent<QueryBuilderProps> = (props) => {
  const { id: operationID } = props.match.params;
  const [operation, setOperation] = useState<OperationMap>();
  const { loading, operation: pageOperation } = useOperation<OperationMap>(
    operationID ? parseInt(operationID) : undefined,
  );
  const sources = useSources({ limit: 200, offset: 0 });

  useEffect(() => {
    // the page operation has precedence i.e in the event of editing
    if (pageOperation) {
      setOperation(pageOperation);
    }
  }, [pageOperation]);

  const onSaveOperation = (preview?: boolean) => {
    console.log('Saving:', preview);
  };

  const onDeleteOperation = (ope?: OperationMap) => {
    console.log('Deleting:', ope);
  };

  const onUpdateOperation = (ope?: OperationMap) => {
    console.log('Updating:', ope);
    setOperation(ope);
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
                operation={operation}
                onSave={onSaveOperation}
                onDelete={onDeleteOperation}
                onUpdate={onUpdateOperation}
              />
            </SourcesContext.Provider>
          ) : null}
        </React.Fragment>
      </Col>
    </Row>
  );
};

export default AdvancedQueryBuilder;

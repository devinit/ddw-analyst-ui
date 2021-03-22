import React, { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { QueryBuilderContainer } from '../../components/QueryBuilderContainer';
import { useOperation, useSources } from '../../hooks';

type RouterParams = {
  id?: string;
};
type QueryBuilderProps = RouteComponentProps<RouterParams>;

const AdvancedQueryBuilder: FunctionComponent<QueryBuilderProps> = (props) => {
  const { id: operationID } = props.match.params;
  const { loading, operation } = useOperation(operationID ? parseInt(operationID) : undefined);
  const sources = useSources({ limit: 200, offset: 0 });

  return (
    <Row>
      <Col>
        <React.Fragment>
          <Dimmer active={loading || !sources.count()} inverted>
            <Loader content="Loading" />
          </Dimmer>
          {!loading && sources.count() ? (
            <QueryBuilderContainer sources={sources.toJS()} operation={operation} />
          ) : null}
        </React.Fragment>
      </Col>
    </Row>
  );
};

export default AdvancedQueryBuilder;
